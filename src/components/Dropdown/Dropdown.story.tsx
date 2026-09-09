import { useState } from 'react';

import { Dropdown, type DropdownOption } from './Dropdown';

export const Default = (properties: { placeholder?: string; options?: DropdownOption[]; allowMultiple?: boolean }) =>
    <Dropdown { ...properties } />;

export const WithOnChange = (properties: { placeholder?: string; options?: DropdownOption[]; allowMultiple?: boolean }) => {
    const [ selected, setSelected ] = useState('');

    return (
        <div>
            <Dropdown
                { ...properties }
                onChange={ (selectedOptions: DropdownOption[]) => {
                    setSelected(JSON.stringify(selectedOptions.map(o => o.label)));
                } }
            />
            <input type="hidden" data-testid="selected-options" value={ selected } />
        </div>
    );
};
