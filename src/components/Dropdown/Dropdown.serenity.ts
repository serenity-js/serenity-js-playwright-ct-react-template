import { contain, Ensure, includes, not } from '@serenity-js/assertions';
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

    placeholder = () =>
        PageElement.located(By.css('.dropdown-placeholder'))
            .of(this.input());

    availableOptionsDropdown = () =>
        PageElement.located(By.css('.dropdown-available-options'))
            .of(this.rootElement)
            .describedAs('available options dropdown');

    availableOptions = () =>
        PageElements.located(By.css('.dropdown-available-option'))
            .of(this.availableOptionsDropdown())
            .describedAs('available options');

    private availableOptionCalled = (name: Answerable<string>) =>
        this.availableOptions()
            .where(Text, includes(name))
            .first();

    selectedOptions = () =>
        PageElements.located(By.css('.dropdown-selected-option'))
            .of(this.input())
            .describedAs('selected options');

    private selectedOptionCalled = (name: Answerable<string>) =>
        this.selectedOptions()
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
            Ensure.that(Text.ofAll(this.selectedOptions()), contain(option)),
        );
    }

    private deselectOne(option: Answerable<string>): Task {
        return Task.where(d`#actor deselects ${ option } from ${ this.rootElement }`,
            Click.on(this.deselectButton().of(this.selectedOptionCalled(option))),
            Ensure.that(Text.ofAll(this.selectedOptions()), not(contain(option))),
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
