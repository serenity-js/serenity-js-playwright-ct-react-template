import { contain, containAtLeastOneItemThat, Ensure, includes, not, startsWith } from '@serenity-js/assertions';
import { Answerable, Check, d, List, QuestionAdapter, Task, Wait } from '@serenity-js/core';
import { By, Click, CssClasses, isVisible, PageElement, PageElements, Text } from '@serenity-js/web';

export class DropdownComponent {
    static from = (rootElement: QuestionAdapter<PageElement>) =>
        new DropdownComponent(rootElement);

    constructor(private readonly rootElement: QuestionAdapter<PageElement>) {
    }

    private input = () =>
        PageElement.located(By.css('.dropdown-input'))
            .describedAs('dropdown input')
            .of(this.rootElement);

    private placeholderElement = () =>
        PageElement.located(By.css('.dropdown-placeholder'))
            .of(this.input());

    placeholder = () =>
        Text.of(this.placeholderElement())
            .describedAs('placeholder');

    private availableOptionsDropdown = () =>
        PageElement.located(By.css('.dropdown-available-options'))
            .of(this.rootElement)
            .describedAs('available options dropdown');

    private availableOptionElements = () =>
        PageElements.located(By.css('.dropdown-available-option'))
            .of(this.availableOptionsDropdown());

    availableOptions = () =>
        Text.ofAll(this.availableOptionElements())
            .describedAs('available options');

    private availableOptionCalled = (name: Answerable<string>) =>
        this.availableOptionElements()
            .where(Text, includes(name))
            .first();

    private selectedOptionElements = () =>
        PageElements.located(By.css('.dropdown-selected-option'))
            .of(this.input());

    selectedElements = () =>
        Text.ofAll(this.selectedOptionElements()).map(name => name.trim())
            .describedAs('selected options');

    private selectedOptionElementCalled = (name: Answerable<string>) =>
        this.selectedOptionElements()
            .where(Text, includes(name))
            .first();

    private deselectButton = () =>
        PageElement.located(By.css('.dropdown-deselect-option'))
            .describedAs('deselect button');

    select(options: Answerable<string[]>): Task {
        return Task.where(d`#actor selects ${ options } from ${ this.rootElement }`,
            List.of(options).forEach(({ item, actor }) =>
                actor.attemptsTo(
                    this.selectOne(item),
                ),
            ),
        );
    }

    deselect(options: Answerable<string[]>): Task {
        return Task.where(d`#actor deselects ${ options } from ${ this.rootElement }`,
            List.of(options).forEach(({ item, actor }) =>
                actor.attemptsTo(
                    this.deselectOne(item),
                ),
            ),
        );
    }

    private selectOne(option: Answerable<string>): Task {
        return Task.where(d`#actor selects ${ option } from ${ this.rootElement }`,
            this.open(),
            Click.on(this.availableOptionCalled(option)),
            Ensure.that(Text.ofAll(this.selectedOptionElements()), containAtLeastOneItemThat(startsWith(option))),
        );
    }

    private deselectOne(option: Answerable<string>): Task {
        return Task.where(d`#actor deselects ${ option } from ${ this.rootElement }`,
            Click.on(this.deselectButton().of(this.selectedOptionElementCalled(option))),
            Ensure.that(Text.ofAll(this.selectedOptionElements()), not(contain(option))),
        );
    }

    open = () =>
        Task.where(`#actor opens the ${ this.rootElement }`,
            Check.whether(CssClasses.of(this.rootElement), not(contain('dropdown-expanded')))
                .andIfSo(
                    Click.on(this.input()),
                    Wait.until(this.availableOptionsDropdown(), isVisible()),
                ),
        )

    close = () =>
        Task.where(`#actor closes the ${ this.rootElement }`,
            Check.whether(CssClasses.of(this.rootElement), contain('dropdown-expanded'))
                .andIfSo(Click.on(this.input())),
        )
}
