import React, { ReactNode } from 'react';

type BaseGameProps = {
    title: string;
    description?: string;
    children: ReactNode;
};

const BaseGame: React.FC<BaseGameProps> = ({ title, description, children }) => {
    return (
        <div className="p-4 border rounded shadow text-center" style={{ maxWidth: 600, margin: 'auto' }}>
            <h4 className="mb-3">{title}</h4>
            {description && <p className="text-muted">{description}</p>}
            <div className="mt-4">
                {children}
            </div>
        </div>
    );
};

export default BaseGame;
