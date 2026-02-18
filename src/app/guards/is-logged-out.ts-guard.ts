import { CanActivateFn, Router } from '@angular/router';
import { User } from '../services/user';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const isLoggedOutTsGuard: CanActivateFn = () => {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;

    const router = inject(Router);
    const user = inject(User);

    return !user.isLoggedIn ? true : router.parseUrl('/document');
};
