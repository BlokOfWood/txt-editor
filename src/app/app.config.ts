import {
    ApplicationConfig,
    inject,
    PLATFORM_ID,
    provideAppInitializer,
    provideBrowserGlobalErrorListeners,
    provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { User } from './services/user';
import { isPlatformBrowser } from '@angular/common';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        provideClientHydration(withEventReplay()),
        provideHttpClient(withFetch()),
        provideAppInitializer(appInit),
        provideZonelessChangeDetection(),
    ],
};

function appInit() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return Promise.resolve();

    return inject(User).init();
}
