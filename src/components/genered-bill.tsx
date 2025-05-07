"use client"
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { PDFDocument, PDFFont, rgb, StandardFonts } from 'pdf-lib';

type FormValues = {
  clientInfo: {
    name: string;
    email: string;
    address: string;
  };
  invoiceInfo: {
    number: string;
    date: string;
    dueDate: string;
  };
  features: {
    id: string;
    description: string;
    quantity: number;
    price: number;
  }[];
  taxEnabled: boolean;
  taxRate: number;
  discount: number;
};

interface InvoiceFormProps {
  locale:string
}

const InvoiceForm:React.FC<InvoiceFormProps> = ({locale}) =>{
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const {
    control,
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      clientInfo: {
        name: '',
        email: '',
        address: '',
      },
      invoiceInfo: {
        number: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
      },
      features: [
        { id: '1', description: 'Développement frontend', quantity: 1, price: 500 },
      ],
      taxEnabled: false,
      taxRate: 20,
      discount: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'features',
  });

  const taxEnabled = watch('taxEnabled');
  const taxRate = watch('taxRate');
  const discount = watch('discount');
  const features = watch('features');

  const calculateSubtotal = () => {
    return features.reduce((sum, feature) => sum + feature.quantity * feature.price, 0);
  };

  const calculateTax = () => {
    if (!taxEnabled) return 0;
    return calculateSubtotal() * (taxRate / 100);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const discountAmount = subtotal * (discount / 100);
    return subtotal + tax - discountAmount;
  };

  const generatePdf = async (data: FormValues) => {
    // Création d'un nouveau document PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);

    // Chargement de la police standard
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Informations de base
    const { width, height } = page.getSize();
    const margin = 50;
    let yPosition = height - margin;

    // Titre
    page.drawText('FACTURE', {
      x: margin,
      y: yPosition,
      size: 24,
      font,
      color: rgb(0, 0, 0),
    });
    yPosition -= 40;

    // Informations de facturation
    page.drawText(`Numéro: ${data.invoiceInfo.number}`, {
      x: margin,
      y: yPosition,
      size: 12,
      font,
    });
    page.drawText(`Date: ${data.invoiceInfo.date}`, {
      x: 300,
      y: yPosition,
      size: 12,
      font,
    });
    yPosition -= 20;

    page.drawText(`Date d'échéance: ${data.invoiceInfo.dueDate}`, {
      x: margin,
      y: yPosition,
      size: 12,
      font,
    });
    yPosition -= 40;

    // Informations client
    page.drawText('Client:', {
      x: margin,
      y: yPosition,
      size: 14,
      font,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;

    page.drawText(data.clientInfo.name, {
      x: margin,
      y: yPosition,
      size: 12,
      font,
    });
    yPosition -= 15;

    page.drawText(data.clientInfo.email, {
      x: margin,
      y: yPosition,
      size: 12,
      font,
    });
    yPosition -= 15;

    page.drawText(data.clientInfo.address, {
      x: margin,
      y: yPosition,
      size: 12,
      font,
    });
    yPosition -= 40;

    // En-tête du tableau
    page.drawText('Description', {
      x: margin,
      y: yPosition,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    page.drawText('Qté', {
      x: 350,
      y: yPosition,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    page.drawText('Prix', {
      x: 400,
      y: yPosition,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    page.drawText('Total', {
      x: 500,
      y: yPosition,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;

    // Lignes de produits
    data.features.forEach((feature) => {
      const lineTotal = feature.quantity * feature.price;
      
      page.drawText(feature.description, {
        x: margin,
        y: yPosition,
        size: 10,
        font,
      });
      page.drawText(feature.quantity.toString(), {
        x: 350,
        y: yPosition,
        size: 10,
        font,
      });
      page.drawText(feature.price.toFixed(2), {
        x: 400,
        y: yPosition,
        size: 10,
        font,
      });
      page.drawText(lineTotal.toFixed(2), {
        x: 500,
        y: yPosition,
        size: 10,
        font,
      });
      yPosition -= 15;
    });

    yPosition -= 30;

    // Totaux
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const total = calculateTotal();

    page.drawText(`Sous-total: ${subtotal.toFixed(2)} €`, {
      x: 400,
      y: yPosition,
      size: 12,
      font,
    });
    yPosition -= 20;

    if (data.taxEnabled) {
      page.drawText(`TVA (${data.taxRate}%): ${tax.toFixed(2)} €`, {
        x: 400,
        y: yPosition,
        size: 12,
        font,
      });
      yPosition -= 20;
    }

    if (data.discount > 0) {
      page.drawText(`Remise (${data.discount}%): -${(subtotal * (data.discount / 100)).toFixed(2)} €`, {
        x: 400,
        y: yPosition,
        size: 12,
        font,
      });
      yPosition -= 20;
    }

    page.drawText(`Total: ${total.toFixed(2)} €`, {
      x: 400,
      y: yPosition,
      size: 14,
      font,
      color: rgb(0, 0, 0),
    });

    // Sauvegarde du PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
    //saveAs(blob, `facture-${data.invoiceInfo.number}.pdf`);
  };

  const onSubmit = async (data: FormValues) => {
    console.log('Données du formulaire:', data)
    try {
        const pdfUrl = await generatePdf(data);
        console.log('PDF URL:', pdfUrl)
        if (pdfUrl) {
            window.open(pdfUrl, '_blank')
            //setPdfUrl(pdfUrl)
        }
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Une erreur est survenue lors de la génération du PDF');
    }
  };
  if(!Cookies.get('logged')){
    router.push('/'+locale+'/login')
  }
  if (loading) return <div className="text-center py-8 mt-[110px] h-[200px] flex justify-center items-center w-[85%] mx-auto">Chargement...</div>;
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-[110px] w-[85%]">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Facturation Freelance</h1>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Informations Client</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  {...register('clientInfo.name', { required: 'Ce champ est requis' })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    errors.clientInfo?.name ? 'border-red-500' : ''
                  }`}
                />
                {errors.clientInfo?.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.clientInfo.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  {...register('clientInfo.email', {
                    required: 'Ce champ est requis',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email invalide',
                    },
                  })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    errors.clientInfo?.email ? 'border-red-500' : ''
                  }`}
                />
                {errors.clientInfo?.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.clientInfo.email.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Adresse</label>
                <textarea
                  {...register('clientInfo.address')}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Informations Facture</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Numéro</label>
                <input
                  {...register('invoiceInfo.number', { required: 'Ce champ est requis' })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    errors.invoiceInfo?.number ? 'border-red-500' : ''
                  }`}
                />
                {errors.invoiceInfo?.number && (
                  <p className="mt-1 text-sm text-red-600">{errors.invoiceInfo.number.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  {...register('invoiceInfo.date', { required: 'Ce champ est requis' })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    errors.invoiceInfo?.date ? 'border-red-500' : ''
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date d'échéance</label>
                <input
                  type="date"
                  {...register('invoiceInfo.dueDate', { required: 'Ce champ est requis' })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    errors.invoiceInfo?.dueDate ? 'border-red-500' : ''
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Fonctionnalités/Prestations</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix Unitaire (€)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total (€)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fields.map((field, index) => (
                  <tr key={field.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        {...register(`features.${index}.description`, {
                          required: 'Description requise',
                        })}
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                          errors.features?.[index]?.description ? 'border-red-500' : ''
                        }`}
                      />
                      {errors.features?.[index]?.description && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.features[index]?.description?.message}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="1"
                        {...register(`features.${index}.quantity`, {
                          required: 'Quantité requise',
                          valueAsNumber: true,
                          min: { value: 1, message: 'Minimum 1' },
                        })}
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                          errors.features?.[index]?.quantity ? 'border-red-500' : ''
                        }`}
                      />
                      {errors.features?.[index]?.quantity && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.features[index]?.quantity?.message}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        {...register(`features.${index}.price`, {
                          required: 'Prix requis',
                          valueAsNumber: true,
                          min: { value: 0, message: 'Minimum 0' },
                        })}
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                          errors.features?.[index]?.price ? 'border-red-500' : ''
                        }`}
                      />
                      {errors.features?.[index]?.price && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.features[index]?.price?.message}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(
                        (features[index]?.quantity || 0) * (features[index]?.price || 0)
                      ).toFixed(2)}{' '}
                      €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={() => append({ id: Date.now().toString(), description: '', quantity: 1, price: 0 })}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Ajouter une fonctionnalité
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="flex items-center">
              <Controller
                name="taxEnabled"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <span className="ml-2 text-sm text-gray-700">Ajouter TVA</span>
            </label>
            {taxEnabled && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">Taux TVA (%)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  {...register('taxRate', {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Minimum 0%' },
                  })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                    errors.taxRate ? 'border-red-500' : ''
                  }`}
                />
                {errors.taxRate && (
                  <p className="mt-1 text-sm text-red-600">{errors.taxRate.message}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Remise (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              {...register('discount', {
                valueAsNumber: true,
                min: { value: 0, message: 'Minimum 0%' },
                max: { value: 100, message: 'Maximum 100%' },
              })}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                errors.discount ? 'border-red-500' : ''
              }`}
            />
            {errors.discount && (
              <p className="mt-1 text-sm text-red-600">{errors.discount.message}</p>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Sous-total:</span>
            <span>{calculateSubtotal().toFixed(2)} €</span>
          </div>
          {taxEnabled && (
            <div className="flex justify-between mb-2">
              <span className="font-medium">TVA ({taxRate}%):</span>
              <span>{calculateTax().toFixed(2)} €</span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between mb-2">
              <span className="font-medium">Remise ({discount}%):</span>
              <span>-{(calculateSubtotal() * (discount / 100)).toFixed(2)} €</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>{calculateTotal().toFixed(2)} €</span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Générer la facture
          </button>
        </div>
      </form>
    </div>
  );
}

export default InvoiceForm;