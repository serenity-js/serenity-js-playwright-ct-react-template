import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';

const ExpandOptionsIcon = () => {
    return (
        <svg height="20" width="20" viewBox="0 0 20 20">
            <path
                d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path>
        </svg>
    );
};

const RemoveOptionIcon = () => {
    return (
        <svg height="20" width="20" viewBox="0 0 20 20">
            <path
                d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path>
        </svg>
    );
};

export interface DropdownProperties {
    placeholder: string;
    options: Array<DropdownOption>;
    onChange: (selectedOptions: Array<DropdownOption>) => void;
    allowMultiple: boolean;
}

export interface DropdownOption {
    value: string;
    label: string;
}

export function Dropdown({ placeholder, options, allowMultiple, onChange }: DropdownProperties) {

    const [ expandOptionsDropdown, setExpandOptionsDropdown ] = useState(false);
    const [ selectedOptions, setSelectedOptions ] = useState<Array<DropdownOption>>([]);
    const inputReference = useRef<HTMLDivElement>(null);

    const isSelected = isOneOf(selectedOptions);

    useEffect(() => {
        const handler = (event: MouseEvent) => {
            if (inputReference.current && ! inputReference.current.contains(event.target as unknown as Node)) {
                setExpandOptionsDropdown(false);
            }
        }

        window.addEventListener('click', handler);

        return () => {
            window.removeEventListener('click', handler);
        };
    });

    const handleExpandMenu = (event: React.MouseEvent) => {
        setExpandOptionsDropdown(! expandOptionsDropdown);
    };

    const handleOptionDeselected = (event: React.MouseEvent, option: DropdownOption) => {
        event.stopPropagation();

        const newOptions = selectedOptionsWithout(option);

        setSelectedOptions(newOptions);
        onChange(newOptions);
    };

    const handleOptionSelected = (option: DropdownOption) => {

        const newOptions = isSelected(option)
            ? selectedOptionsWithout(option)
            : [ ...selectedOptions, option ];

        setSelectedOptions(newOptions);
        onChange(newOptions);
    }

    const selectedOptionsWithout = (option: DropdownOption): DropdownOption[] => {
        return selectedOptions.filter(current => current.value !== option.value);
    };

    const renderSelectedOptionsOrPlaceholder = () => {
        if (selectedOptions.length === 0) {
            return (
                <span className={'dropdown-placeholder'}>{ placeholder }</span>
            )
        }

        return (
            <ul className="dropdown-selected-options">
                { selectedOptions.map((option) => (
                    <li key={ option.value } className="dropdown-selected-option">
                        <span>{ option.label }</span>
                        { allowMultiple && (
                            <span
                                onClick={ event => handleOptionDeselected(event, option) }
                                className="dropdown-deselect-option">
                                <RemoveOptionIcon/>
                            </span>
                        )}
                    </li>
                )) }
            </ul>
        );
    };

    return (
        <div className={ clsx('dropdown-widget', expandOptionsDropdown && 'dropdown-expanded') }>
            <div ref={inputReference} onClick={ handleExpandMenu } className='dropdown-input'>
                { renderSelectedOptionsOrPlaceholder() }
                <div className="dropdown-expand-icon">
                    <ExpandOptionsIcon/>
                </div>
            </div>
            { expandOptionsDropdown && (
                <ul className="dropdown-available-options">
                    { options.map(option => (
                        <li
                            onClick={ () => handleOptionSelected(option) }
                            key={ option.value }
                            className={ clsx('dropdown-available-option', isSelected(option) && 'selected') }>
                            { option.label }
                        </li>
                    )) }
                </ul>
            ) }
        </div>
    );
}

Dropdown.defaultProps = {
    placeholder: 'Select option',
    onChange: (selectedOptions: DropdownOption[]) => void 0,
    allowMultiple: false,
}

function isOneOf(options: DropdownOption[]): (option: DropdownOption) => boolean {
    return (option: DropdownOption): boolean => {
        return options.some(current => current.value === option.value)
    }
}
