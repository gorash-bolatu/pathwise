import React, { ReactNode } from 'react';

type BaseGameProps = {
    title: string;
    description?: string;
    children: ReactNode;
};

/**
 * jsdoc от дикпика
 * 
 * @component
 * A reusable layout wrapper for games, providing consistent styling and structure.
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Game title (will be displayed in uppercase)
 * @param {string} [props.description] - Optional game description/instructions
 * @param {ReactNode} props.children - Game-specific content to render inside the layout
 * 
 * @example
 * ```tsx
 * <BaseGame 
 *   title="Vocabulary Quiz" 
 *   description="Match words to their definitions"
 * >
 *   <BlankFillGame />
 * </BaseGame>
 * ```
 * @returns {JSX.Element} A styled game container with title, description, and content area
 */
const BaseGame: React.FC<BaseGameProps> = ({ title, description, children }) => {
    return (
        <div className="p-4 border rounded shadow text-center" style={{ maxWidth: 600, margin: 'auto' }}>
            <h4 className="mb-3">{title.toUpperCase()}</h4>
            {description && <p className="text-muted">{description}</p>}
            <div className="mt-4">
                {children}
            </div>
        </div>
    );
};

export default BaseGame;
