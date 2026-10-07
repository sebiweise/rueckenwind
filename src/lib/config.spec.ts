import { expect, it } from 'vitest';
import { APP_NAME, APP_SUBTITLE, APP_TITLE } from './config';

it('builds the title from name and subtitle', () => {
	expect(APP_TITLE).toBe(`${APP_NAME} – ${APP_SUBTITLE}`);
});
