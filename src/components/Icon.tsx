"use client"
import React from "react";

interface IconProp {
    name: string; // Changement ici pour rendre `name` plus flexible
    size?: string;
    color?: string;
    animation?: string; // Liste des animations disponibles
    flip?:string; // Liste des flips disponibles
}

const Icon: React.FC<IconProp> = ({
    name,
    size = "1em",
    color = "var(--textcolorprimary)",
    animation = "",
    flip = "",
}) => {
    // Construire les classes dynamiques en fonction des props
    const animationClass = animation ? `bx-${animation}` : "";
    const flipClass = flip ? `bx-flip-${flip}` : "";

    // Classe finale
    const iconClass = `bx ${name} ${animationClass} ${flipClass}`;

    return <i className={iconClass} style={{ fontSize: size, color:color }}></i>;
};

export default Icon;
