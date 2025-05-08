"use client"
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { PDFDocument, PDFFont, rgb, StandardFonts } from 'pdf-lib';

interface clientInfo {
  name: string;
  email: string;
  address: string;
}

interface invoiceInfo {
  number: string;
  date: string;
  dueDate: string;
}

interface features {
  id: number;
  description: string;
  quantity: number;
  price: number;
};

type FormValues = {
  clientInfo: clientInfo;
  invoiceInfo: invoiceInfo;
  features: features[];
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

  const [clientInfo, setClientInfo] = useState<clientInfo>({
    name: '',
    email: '',
    address: '',
  });

  const [invoiceInfo, setInvoiceInfo] = useState<invoiceInfo>({
    number: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
  });

  const [features, setFeatures] = useState<features[]>([]);

  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxRate, setTaxRate] = useState(20);
  const [discount, setDiscount] = useState(0);

  const addFeature = () => {
    setFeatures([
      ...features,
      {
        id: Date.now(),
        description: '',
        quantity: 1,
        price: 0,
      },
    ]);
  };

  const removeFeature = (id: number) => {
    setFeatures(features.filter((feature) => feature.id !== id));
  };

  const updateFeature = (id: number, field: string, value: string | number) => {
    setFeatures(
      features.map((feature) =>
        feature.id === id ? { ...feature, [field]: value } : feature
      )
    );
  };

  const calculateSubtotal = () => {
    return features.reduce(
      (sum, feature) => sum + feature.quantity * feature.price,
      0
    );
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
  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    // Ici vous pourriez envoyer les données à une API ou générer un PDF
    const data = {clientInfo,invoiceInfo,features,taxEnabled,taxRate,discount} as FormValues
    const pdfUrl = await generatePdf(data)
    if (pdfUrl) {
      window.open(pdfUrl, '_blank')
        //setPdfUrl(pdfUrl)
    }
    console.log({
      clientInfo,
      invoiceInfo,
      features,
      taxEnabled,
      taxRate,
      discount,
      total: calculateTotal(),
    });
  };
  
  const canSendBill = () => {
    return (
      clientInfo.name &&
      clientInfo.email &&
      clientInfo.address &&
      invoiceInfo.number &&
      invoiceInfo.date &&
      invoiceInfo.dueDate &&
      features.length > 0
    );
  };

  if(!Cookies.get('logged')){
    router.push('/'+locale+'/login')
  }
  if (loading) return <div className="text-center py-8 mt-[110px] h-[200px] flex justify-center items-center w-[85%] mx-auto">Chargement...</div>;
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-[110px] w-[85%]">
      <h1 className="text-2xl font-bold text-primary mb-6">Facturation pour le client ...</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Informations Client</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  className="mt-1 block px-[.95rem] py-[.525rem] text-[.775rem] w-full rounded-[.4rem] bg-gray-100 focus:outline-gray-200"
                  value={clientInfo.name}
                  onChange={(e) =>
                    setClientInfo({ ...clientInfo, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 block px-[.95rem] py-[.525rem] text-[.775rem] w-full rounded-[.4rem] bg-gray-100 focus:outline-gray-200"
                  value={clientInfo.email}
                  onChange={(e) =>
                    setClientInfo({ ...clientInfo, email: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Adresse</label>
                <textarea
                  className="mt-1 block px-[.95rem] py-[.525rem] text-[.775rem] w-full rounded-[.4rem] bg-gray-100 focus:outline-gray-200"
                  rows={3}
                  value={clientInfo.address}
                  onChange={(e) =>
                    setClientInfo({ ...clientInfo, address: e.target.value })
                  }
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
                  type="text"
                  className="mt-1 block px-[.95rem] py-[.525rem] text-[.775rem] w-full rounded-[.4rem] bg-gray-100 focus:outline-gray-200"
                  value={invoiceInfo.number}
                  onChange={(e) =>
                    setInvoiceInfo({ ...invoiceInfo, number: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  className="mt-1 block px-[.95rem] py-[.525rem] text-[.775rem] w-full rounded-[.4rem] bg-gray-100 focus:outline-gray-200"
                  value={invoiceInfo.date}
                  onChange={(e) =>
                    setInvoiceInfo({ ...invoiceInfo, date: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date d'échéance</label>
                <input
                  type="date"
                  className="mt-1 block px-[.95rem] py-[.525rem] text-[.775rem] w-full rounded-[.4rem] bg-gray-100 focus:outline-gray-200"
                  value={invoiceInfo.dueDate}
                  onChange={(e) =>
                    setInvoiceInfo({ ...invoiceInfo, dueDate: e.target.value })
                  }
                  required
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
                {features.map((feature) => (
                  <tr key={feature.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        className="block px-[.95rem] py-[.525rem] text-[.775rem] w-full rounded-[.4rem] bg-gray-100 focus:outline-gray-200"
                        value={feature.description}
                        onChange={(e) =>
                          updateFeature(feature.id, 'description', e.target.value)
                        }
                        required
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="1"
                        className="block px-[.95rem] py-[.525rem] text-[.775rem] w-full rounded-[.4rem] bg-gray-100 focus:outline-gray-200"
                        value={feature.quantity}
                        onChange={(e) =>
                          updateFeature(feature.id, 'quantity', parseInt(e.target.value) || 0)
                        }
                        required
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="block px-[.95rem] py-[.525rem] text-[.775rem] w-full rounded-[.4rem] bg-gray-100 focus:outline-gray-200"
                        value={feature.price}
                        onChange={(e) =>
                          updateFeature(feature.id, 'price', parseFloat(e.target.value) || 0)
                        }
                        required
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(feature.quantity * feature.price).toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => removeFeature(feature.id)}
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
            onClick={addFeature}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Ajouter une fonctionnalité
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                checked={taxEnabled}
                onChange={(e) => setTaxEnabled(e.target.checked)}
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
                  className="mt-1 px-[.95rem] py-[.525rem] text-[.775rem] w-full rounded-[.4rem] bg-gray-100 focus:outline-gray-200"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Remise (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              className="mt-1 block px-[.95rem] py-[.525rem] text-[.775rem] w-full rounded-[.4rem] bg-gray-100 focus:outline-gray-200"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
            />
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

        <div className="flex items-center justify-end gap-4">
          <a href={'/'+locale+'/clients-list'} className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Liste client</a>
          <button disabled={!canSendBill()}
            type="submit"
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              loading || !canSendBill() ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-1'
            }`}
          >
            Générer la facture
          </button>
        </div>
      </form>
    </div>
  );
}

export default InvoiceForm;