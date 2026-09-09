import { contain, containAtLeastOneItemThat, Ensure, includes, not, startsWith } from '@serenity-js/assertions';
import type { Answerable, QuestionAdapter } from '@serenity-js/core';
import { Check, d, List, Task, Wait } from '@serenity-js/core';
import type { PageElementAdapter } from '@serenity-js/web';
import { By, Click, isVisible, PageElement, PageElements, Text } from '@serenity-js/web';

export class Dropdown<NET = unknown> {

    private readonly rootElement: PageElementAdapter<NET>;

    constructor(rootElement: Answerable<PageElement<NET>>) {
        this.rootElement = PageElement.createAdapter(rootElement);
    }

    // Questions (nouns) — what the user observes

    placeholder = (): QuestionAdapter<string> =>
        Text.of(this.placeholderElement())
            .describedAs('placeholder');

    availableOptions = (): QuestionAdapter<string[]> =>
        Text.ofAll(this.availableOptionElements())
            .describedAs('available options');

    selectedOptions = (): QuestionAdapter<string[]> =>
        Text.ofAll(this.selectedOptionElements())
            .map(name => name.trim())
            .describedAs('selected options');

    // Tasks (verbs) — what the user does

    open = (): Task =>
        Task.where('#actor opens the dropdown',
            Check.whether(this.availableOptionsList(), not(isVisible()))
                .andIfSo(
                    Click.on(this.input()),
                    Wait.until(this.availableOptionsList(), isVisible()),
                ),
        );

    close = (): Task =>
        Task.where('#actor closes the dropdown',
            Check.whether(this.availableOptionsList(), isVisible())
                .andIfSo(Click.on(this.input())),
        );

    select = (options: Answerable<string[]>): Task =>
        Task.where(d`#actor selects ${ options }`,
            List.of(options).forEach(({ item, actor }) =>
                actor.attemptsTo(
                    this.selectOne(item),
                ),
            ),
        );

    deselect = (options: Answerable<string[]>): Task =>
        Task.where(d`#actor deselects ${ options }`,
            List.of(options).forEach(({ item, actor }) =>
                actor.attemptsTo(
                    this.deselectOne(item),
                ),
            ),
        );

    // Private — element locators scoped within rootElement

    private input = () =>
        this.rootElement.element(By.css('.dropdown-input'))
            .describedAs('input field');

    private placeholderElement = () =>
        this.rootElement.element(By.css('.dropdown-placeholder'))
            .describedAs('placeholder element');

    private availableOptionsList = () =>
        this.rootElement.element(By.css('.dropdown-available-options'))
            .describedAs('available options list');

    private availableOptionElements = () =>
        PageElements.located(By.css('.dropdown-available-option'))
            .of(this.availableOptionsList());

    private availableOptionCalled = (name: Answerable<string>) =>
        this.availableOptionElements()
            .where(Text, includes(name))
            .first();

    private selectedOptionElements = () =>
        PageElements.located(By.css('.dropdown-selected-option'))
            .of(this.input());

    private selectedOptionElementCalled = (name: Answerable<string>) =>
        this.selectedOptionElements()
            .where(Text, includes(name))
            .first();

    private deselectButton = () =>
        PageElement.located(By.css('.dropdown-deselect-option'))
            .describedAs('deselect button');

    private selectOne = (option: Answerable<string>): Task =>
        Task.where(d`#actor selects ${ option }`,
            this.open(),
            Click.on(this.availableOptionCalled(option)),
            Ensure.that(Text.ofAll(this.selectedOptionElements()), containAtLeastOneItemThat(startsWith(option))),
        );

    private deselectOne = (option: Answerable<string>): Task =>
        Task.where(d`#actor deselects ${ option }`,
            Click.on(this.deselectButton().of(this.selectedOptionElementCalled(option))),
            Ensure.that(Text.ofAll(this.selectedOptionElements()), not(contain(option))),
        );
}
