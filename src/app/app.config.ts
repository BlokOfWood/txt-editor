import {
    ApplicationConfig,
    inject,
    PLATFORM_ID,
    provideAppInitializer,
    provideBrowserGlobalErrorListeners,
    provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, Router } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { User } from './services/user';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { Encryption } from './services/encryption';

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

async function appInit() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return Promise.resolve();

    const user = inject(User);
    const encryption = inject(Encryption);
    const router = inject(Router);

    await firstValueFrom(user.init(), { defaultValue: null });
    await encryption.loadEncryptionKey();

    return;
}
