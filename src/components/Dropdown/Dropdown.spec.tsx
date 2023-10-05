import React from 'react'

import { test as componentTest } from '@playwright/experimental-ct-react';
import { useBase } from '@serenity-js/playwright-test';
import { PageElement } from '@serenity-js/web';

import { Dropdown, DropdownOption } from './Dropdown';
import { DropdownComponent } from './Dropdown.serenity';
import { Ensure, equals } from '@serenity-js/assertions';
import { notes } from '@serenity-js/core';

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

        const dropdownComponent = DropdownComponent.from(
            PageElement.from(await mount(
                <Dropdown placeholder={ placeholder }
                          options={ options }
                />,
            )).describedAs('dropdown'),
        );

        await actor.attemptsTo(
            Ensure.eventually(
                dropdownComponent.placeholder(),
                equals(placeholder),
            ),
        )
    });

    it('shows the available options when the menu is expanded', async ({ mount, actor }) => {
        const dropdownComponent = DropdownComponent.from(
            PageElement.from(await mount(
                <Dropdown options={ options }/>,
            )).describedAs('dropdown'),
        );

        await actor.attemptsTo(
            dropdownComponent.open(),

            Ensure.eventually(
                dropdownComponent.availableOptions(),
                equals(labels),
            ),
        )
    });

    it('selects the desired options', async ({ mount, actor }) => {
        const dropdownComponent = DropdownComponent.from(
            PageElement.from(await mount(
                <Dropdown allowMultiple options={ options }/>,
            )).describedAs('dropdown'),
        );

        await actor.attemptsTo(
            dropdownComponent.select([
                'First',
                'Third'
            ]),

            Ensure.that(dropdownComponent.selectedElements(), equals([
                'First',
                'Third',
            ])),
        );
    });

    it('triggers onChange with selected options', async ({ mount, actor }) => {
        const dropdownComponent = DropdownComponent.from(
            PageElement.from(await mount(
                <Dropdown allowMultiple
                          options={ options }
                          onChange={ selectedOptions => actor.attemptsTo(
                              notes().set('selectedOptions', selectedOptions.map(option => option.label))
                          ) }
                />,
            )).describedAs('dropdown'),
        );

        await actor.attemptsTo(
            dropdownComponent.select([
                'First',
                'Third'
            ]),

            Ensure.eventually(notes().get('selectedOptions'), equals([
                'First',
                'Third',
            ])),
        );
    });

    it('allows for selected options to be deselected', async ({ mount, actor }) => {
        const dropdownComponent = DropdownComponent.from(
            PageElement.from(await mount(
                <Dropdown allowMultiple options={ options } />,
            )).describedAs('dropdown'),
        );

        await actor.attemptsTo(
            dropdownComponent.select([
                'First',
                'Third',
                'Second',
            ]),

            dropdownComponent.deselect([
                'First',
            ]),

            Ensure.that(dropdownComponent.selectedElements(), equals([
                'Third',
                'Second',
            ])),
        );
    });

    it('goes back to showing the placeholder when all the selected options get deselected', async ({ mount, actor }) => {
        const placeholder = 'Select option';

        const dropdownComponent = DropdownComponent.from(
            PageElement.from(await mount(
                <Dropdown allowMultiple
                          placeholder={ placeholder }
                          options={ options } />,
            )).describedAs('dropdown'),
        );

        await actor.attemptsTo(
            dropdownComponent.select([
                'First',
                'Second',
            ]),

            dropdownComponent.deselect([
                'First',
                'Second',
            ]),

            Ensure.that(dropdownComponent.selectedElements().length, equals(0)),
            Ensure.that(
                dropdownComponent.placeholder(),
                equals(placeholder),
            ),
        );
    });
});
