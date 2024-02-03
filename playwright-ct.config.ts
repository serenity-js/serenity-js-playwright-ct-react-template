import { defineConfig, devices } from '@playwright/experimental-ct-react';
import { SerenityOptions } from '@serenity-js/playwright-test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<SerenityOptions>({
    testDir: './src',
    /* The base directory, relative to the config file, for snapshot files created with toMatchSnapshot and toHaveScreenshot. */
    snapshotDir: './__snapshots__',
    /* Maximum time one test can run for. */
    timeout: 10 * 1000,
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        [ 'line' ],
        [ 'html', { open: 'never' } ],
        [ '@serenity-js/playwright-test', {
            crew: [
                [ '@serenity-js/serenity-bdd', { specDirectory: './src' } ],
                '@serenity-js/console-reporter',
                [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: './target/site/serenity' } ],
                // [ '@serenity-js/core:StreamReporter', { outputFile: './target/events.ndjson' }]
            ],
        } ],
    ],

    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',

        /* Port to use for Playwright component endpoint. */
        ctPort: 3100,

        /* Set headless: false to see the browser window */
        headless: true,

        crew: [
            [ '@serenity-js/web:Photographer', {
                strategy: 'TakePhotosOfInteractions'
                // strategy: 'TakePhotosOfFailures'
            } ]
        ],
        defaultActorName: 'Tess',
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
    ],
});
