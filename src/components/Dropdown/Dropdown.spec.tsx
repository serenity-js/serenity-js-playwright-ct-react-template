import { test as componentTest } from '@playwright/experimental-ct-react';
import { Ensure, equals } from '@serenity-js/assertions';
import { notes } from '@serenity-js/core';
import { useBase } from '@serenity-js/playwright-test';
import { PageElement } from '@serenity-js/web';
import React from 'react';

import { Dropdown as DropdownComponent, DropdownOption } from './Dropdown.js';
import { Dropdown } from './Dropdown.serenity.js';

const { it, describe } = useBase(componentTest);

describe('Dropdown', () => {

    const labels = [
        'First',
        'Second',
        'Third',
    ];

    const options: DropdownOption[] = labels.map(label => ({
        value: label.toLowerCase(),
        label,
    }));

    it('shows the placeholder when no option is selected yet', async ({ mount, actor }) => {
        const placeholder = 'Select option';

        const dropdownComponent = PageElement.from(await mount(
            <DropdownComponent placeholder={ placeholder } options={ options } />,
        )).describedAs('dropdown')

        await actor.attemptsTo(
            Ensure.eventually(
                Dropdown.placeholder().of(dropdownComponent),
                equals(placeholder),
            ),
        )
    });

    it('shows the available options when the menu is expanded', async ({ mount, actor }) => {
        const dropdownComponent = PageElement.from(await mount(
            <DropdownComponent options={ options }/>,
        )).describedAs('dropdown')

        await actor.attemptsTo(
            Dropdown.open(dropdownComponent),

            Ensure.eventually(
                Dropdown.availableOptions().of(dropdownComponent),
                equals(labels),
            ),
        )
    });

    it('selects the desired options', async ({ mount, actor }) => {
        const dropdownComponent = PageElement.from(await mount(
            <DropdownComponent allowMultiple options={ options }/>,
        )).describedAs('dropdown')

        await actor.attemptsTo(
            Dropdown.select([
                'First',
                'Third'
            ]).from(dropdownComponent),

            Ensure.that(Dropdown.selectedOptions().of(dropdownComponent), equals([
                'First',
                'Third',
            ])),
        );
    });

    it('triggers onChange with selected options', async ({ mount, actor }) => {
        const dropdownComponent = PageElement.from(await mount(
            <DropdownComponent allowMultiple
                options={ options }
                onChange={ selectedOptions => actor.attemptsTo(
                    notes().set('selectedOptions', selectedOptions.map(option => option.label))
                ) }
            />,
        )).describedAs('dropdown')

        await actor.attemptsTo(
            Dropdown.select([
                'First',
                'Third'
            ]).from(dropdownComponent),

            Ensure.eventually(notes().get('selectedOptions'), equals([
                'First',
                'Third',
            ])),
        )
    });

    it('allows for selected options to be deselected', async ({ mount, actor }) => {
        const dropdownComponent = PageElement.from(await mount(
            <DropdownComponent allowMultiple options={ options } />,
        )).describedAs('dropdown')

        await actor.attemptsTo(
            Dropdown.select([
                'First',
                'Third',
                'Second',
            ]).from(dropdownComponent),

            Dropdown.deselect([
                'First',
            ]).from(dropdownComponent),

            Ensure.that(Dropdown.selectedOptions().of(dropdownComponent), equals([
                'Third',
                'Second',
            ])),
        );
    });

    it('goes back to showing the placeholder when all the selected options get deselected', async ({ mount, actor }) => {
        const placeholder = 'Select option';

        const dropdownComponent = PageElement.from(await mount(
            <DropdownComponent allowMultiple
                placeholder={ placeholder }
                options={ options } />,
        )).describedAs('dropdown')

        await actor.attemptsTo(
            Dropdown.select([
                'First',
                'Second',
            ]).from(dropdownComponent),

            Dropdown.deselect([
                'First',
                'Second',
            ]).from(dropdownComponent),

            Ensure.that(Dropdown.selectedOptions().of(dropdownComponent).length, equals(0)),
            Ensure.that(
                Dropdown.placeholder().of(dropdownComponent),
                equals(placeholder),
            ),
        );
    });
});
