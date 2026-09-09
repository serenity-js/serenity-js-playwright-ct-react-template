import { useState } from 'react';

import { Dropdown, type DropdownOption } from './Dropdown';

export const Default = (props: { placeholder?: string; options?: DropdownOption[]; allowMultiple?: boolean }) =>
    <Dropdown { ...props } />;

export const WithOnChange = (props: { placeholder?: string; options?: DropdownOption[]; allowMultiple?: boolean }) => {
    const [ selected, setSelected ] = useState('');

    return (
        <div>
            <Dropdown
                { ...props }
                onChange={ (selectedOptions: DropdownOption[]) => {
                    setSelected(JSON.stringify(selectedOptions.map(o => o.label)));
                } }
            />
            <input type="hidden" data-testid="selected-options" value={ selected } />
        </div>
    );
};
