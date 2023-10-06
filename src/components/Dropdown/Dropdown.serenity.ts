import { contain, containAtLeastOneItemThat, Ensure, includes, not, startsWith } from '@serenity-js/assertions'
import { Answerable, Check, d, List, QuestionAdapter, Task, Wait } from '@serenity-js/core'
import { By, Click, CssClasses, isVisible, PageElement, PageElements, Text } from '@serenity-js/web'

export class Dropdown {
    private static componentSelector = () => By.css('.dropdown-input')

    static component = <NET = any>() =>
        PageElement.located<NET>(this.componentSelector()).describedAs('dropdown')

    static components = <NET = any>() =>
        PageElements.located<NET>(this.componentSelector()).describedAs('dropdowns')

    private static input = () =>
        PageElement.located(By.css('.dropdown-input'))
            .describedAs('input field')

    private static placeholderElement = () =>
        PageElement.located(By.css('.dropdown-placeholder'))
            .of(Dropdown.input())

    static placeholder = () =>
        Text.of(Dropdown.placeholderElement())
            .describedAs('placeholder')

    private static availableOptionsList = () =>
        PageElement.located(By.css('.dropdown-available-options'))

    private static availableOptionElements = () =>
        PageElements.located(By.css('.dropdown-available-option'))
            .of(Dropdown.availableOptionsList())

    static availableOptions = () =>
        Text.ofAll(this.availableOptionElements())
            .describedAs('available options')

    private static availableOptionCalled = (name: Answerable<string>) =>
        this.availableOptionElements()
            .where(Text, includes(name))
            .first()

    private static selectedOptionElements = () =>
        PageElements.located(By.css('.dropdown-selected-option'))
            .of(Dropdown.input())

    static selectedOptions = () => ({
        of: (dropdown: QuestionAdapter<PageElement>) =>
            Text.ofAll(Dropdown.selectedOptionElements())
                .of(dropdown)
                .map(name => name.trim())
                .describedAs('selected options')
    })

    private static selectedOptionElementCalled = (name: Answerable<string>) =>
        Dropdown.selectedOptionElements()
            .where(Text, includes(name))
            .first()

    private static deselectButton = () =>
        PageElement.located(By.css('.dropdown-deselect-option'))
            .describedAs('deselect button')

    static select = (options: Answerable<string[]>) => ({
        from: (dropdown: QuestionAdapter<PageElement>) =>
            Task.where(d`#actor selects ${ options } from ${ dropdown }`,
                List.of(options).forEach(({ item, actor }) =>
                    actor.attemptsTo(
                        Dropdown.selectOne(item).from(dropdown),
                    ),
                ),
            )
    })

    static deselect = (options: Answerable<string[]>) => ({
        from: (dropdown: QuestionAdapter<PageElement>) =>
            Task.where(d`#actor deselects ${ options } from ${ dropdown }`,
                List.of(options).forEach(({ item, actor }) =>
                    actor.attemptsTo(
                        Dropdown.deselectOne(item).from(dropdown),
                    ),
                ),
            )
    })

    private static selectOne = (option: Answerable<string>)  => ({
        from: (dropdown: QuestionAdapter<PageElement>) =>
            Task.where(d`#actor selects ${ option } from ${ dropdown }`,
                Dropdown.open(dropdown),
                Click.on(this.availableOptionCalled(option)),
                Ensure.that(Text.ofAll(this.selectedOptionElements()), containAtLeastOneItemThat(startsWith(option))),
            )
    })

    private static deselectOne = (option: Answerable<string>) => ({
        from: (dropdown: QuestionAdapter<PageElement>) =>
            Task.where(d`#actor deselects ${ option } from ${ dropdown }`,
                Click.on(Dropdown.deselectButton().of(Dropdown.selectedOptionElementCalled(option))),
                Ensure.that(Text.ofAll(this.selectedOptionElements()), not(contain(option))),
            )
    })

    static open = (dropdown: QuestionAdapter<PageElement>) =>
        Task.where(`#actor opens the ${ dropdown }`,
            Check.whether(CssClasses.of(dropdown), not(contain('dropdown-expanded')))
                .andIfSo(
                    Click.on(this.input()),
                    Wait.until(this.availableOptionsList(), isVisible()),
                ),
        )

    static close = (dropdown: QuestionAdapter<PageElement>) =>
        Task.where(`#actor closes the ${ dropdown }`,
            Check.whether(CssClasses.of(dropdown), contain('dropdown-expanded'))
                .andIfSo(Click.on(Dropdown.input())),
        )
}
