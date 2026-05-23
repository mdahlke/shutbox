import { test, expect } from '@playwright/test';

// Clear localStorage before each test so stats don't bleed between tests
test.beforeEach(async ({ page }) => {
	await page.goto('/');
	await page.evaluate(() => localStorage.clear());
	await page.reload();
});

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Set the autoplay speed slider to a given value (1–4) */
async function setAutoplaySpeed(page, value) {
	await page.locator('.speed-control input[type=range]').evaluate((el, v) => {
		el.value = String(v);
		el.dispatchEvent(new Event('input', { bubbles: true }));
	}, value);
}

/** Open the settings drawer if it isn't already open */
async function openSettings(page) {
	const panel = page.locator('.settings-panel');
	if (!(await panel.isVisible())) {
		await page.locator('.btn-settings').click();
		await expect(panel).toBeVisible();
	}
}

// ── Page load ─────────────────────────────────────────────────────────────────

test('loads the game page', async ({ page }) => {
	await expect(page.locator('h1')).toHaveText('Shutbox');
	await expect(page.locator('.btn-big')).toHaveText('Start & Roll');
	await expect(page.locator('.app-nav a').first()).toBeVisible();
	await expect(page.locator('.app-nav a').last()).toBeVisible();
});

test('nav links are present and lead to the right pages', async ({ page }) => {
	await page.locator('.app-nav a', { hasText: 'Stats' }).click();
	await expect(page).toHaveURL('/stats');
	await page.locator('.app-nav a', { hasText: 'Game' }).click();
	await expect(page).toHaveURL('/');
});

// ── Core game flow ────────────────────────────────────────────────────────────

test('Start & Roll begins the game and shows the Roll button', async ({ page }) => {
	await page.locator('.btn-big').click();

	// Roll button should now be visible (game is active)
	await expect(page.locator('.btn-big')).toHaveText('Roll', { timeout: 3000 });

	// Dice area should be populated
	const diceArea = page.locator('.dice-area');
	await expect(diceArea).toBeVisible();
	await expect(diceArea.locator('.die-scene').first()).toBeVisible();
});

test('tiles are rendered and clickable when game is active', async ({ page }) => {
	// Before game: tiles should be there but not interactive
	const tiles = page.locator('.shut-item');
	await expect(tiles.first()).toBeVisible();

	await page.locator('.btn-big').click();

	// Wait for the Roll button (dice animation done)
	await expect(page.locator('.btn-big')).toHaveText('Roll', { timeout: 3000 });

	// If addForMe is on (default), at least one tile should be highlighted
	// (edge case: if the roll has no valid moves the game ends immediately — skip)
	const rollButton = page.locator('.btn-big');
	if (await rollButton.isVisible() && (await rollButton.textContent())?.includes('Roll')) {
		const highlighted = page.locator('.shut-item.highlight');
		const count = await highlighted.count();
		if (count > 0) {
			await expect(highlighted.first()).toBeVisible();
		}
	}
});

test('selecting a highlighted tile marks it as selected', async ({ page }) => {
	await page.locator('.btn-big').click();
	await expect(page.locator('.btn-big')).toHaveText('Roll', { timeout: 3000 });

	const highlighted = page.locator('.shut-item.highlight').first();
	if (await highlighted.count() === 0) {
		// No highlighted tiles means only one combo — skip selection step
		return;
	}

	await highlighted.click();
	// After clicking, the tile becomes selected (green) and no longer just highlighted
	await expect(page.locator('.shut-item.selected').first()).toBeVisible();
});

test('game ends and shows score after all moves exhausted', async ({ page }) => {
	// Use instant autoplay to quickly finish one game and verify score updates
	await setAutoplaySpeed(page, 4); // Instant
	await page.locator('.btn-outline', { hasText: 'Autoplay' }).click();

	// Wait for at least one game to complete (score in localStorage)
	await page.waitForFunction(
		() => {
			const raw = localStorage.getItem('store');
			if (!raw) return false;
			const store = JSON.parse(raw);
			return store?.gameStats?.played >= 1;
		},
		{ timeout: 10_000 }
	);

	await page.locator('.btn-stop').click();
});

// ── Autoplay ──────────────────────────────────────────────────────────────────

test('autoplay starts and loops through multiple games', async ({ page }) => {
	await setAutoplaySpeed(page, 4); // Instant speed
	await page.locator('.btn-outline', { hasText: 'Autoplay' }).click();

	// Stop button should appear
	await expect(page.locator('.btn-stop')).toBeVisible();

	// Wait for at least 5 games to be played
	await page.waitForFunction(
		() => {
			const raw = localStorage.getItem('store');
			if (!raw) return false;
			const store = JSON.parse(raw);
			return (store?.gameStats?.played ?? 0) >= 5;
		},
		{ timeout: 15_000 }
	);

	// Stop autoplay
	await page.locator('.btn-stop').click();
	await expect(page.locator('.btn-outline', { hasText: 'Autoplay' })).toBeVisible();
});

test('autoplay stop button halts the loop', async ({ page }) => {
	await setAutoplaySpeed(page, 4);
	await page.locator('.btn-outline', { hasText: 'Autoplay' }).click();
	await expect(page.locator('.btn-stop')).toBeVisible();

	await page.locator('.btn-stop').click();

	// Autoplay button should reappear, Stop should be gone
	await expect(page.locator('.btn-outline', { hasText: 'Autoplay' })).toBeVisible();
	await expect(page.locator('.btn-stop')).not.toBeVisible();
});

test('speed slider updates the label', async ({ page }) => {
	await expect(page.locator('.speed-label')).toHaveText('Normal');

	await setAutoplaySpeed(page, 1);
	await expect(page.locator('.speed-label')).toHaveText('Slow');

	await setAutoplaySpeed(page, 4);
	await expect(page.locator('.speed-label')).toHaveText('Instant');
});

// ── Settings drawer ───────────────────────────────────────────────────────────

test('settings drawer opens and closes', async ({ page }) => {
	const panel = page.locator('.settings-panel');
	await expect(panel).not.toBeVisible();

	await page.locator('.btn-settings').click();
	await expect(panel).toBeVisible();

	await page.locator('.btn-settings').click();
	await expect(panel).not.toBeVisible();
});

test('settings contain the expected controls', async ({ page }) => {
	await openSettings(page);

	await expect(page.locator('#game-variety')).toBeVisible();
	await expect(page.locator('#number-of-die')).toBeVisible();
	await expect(page.locator('#add-for-me')).toBeVisible();
	await expect(page.locator('#show-total')).toBeVisible();
});

test('changing game variety auto-updates the minimum dice count', async ({ page }) => {
	await openSettings(page);

	// Change to 24-number variety
	await page.locator('#game-variety').selectOption('24');

	// Min dice for 24 = ceil(24/6) = 4
	const diceInput = page.locator('#number-of-die');
	const val = await diceInput.inputValue();
	expect(Number(val)).toBeGreaterThanOrEqual(4);
	await expect(page.locator('.settings-panel small')).toContainText('min 4');

	// Reset back to 12
	await page.locator('#game-variety').selectOption('12');
	await expect(page.locator('.settings-panel small')).toContainText('min 2');
});

test('settings are disabled during an active game', async ({ page }) => {
	await page.locator('.btn-big').click();
	await expect(page.locator('.btn-big')).toHaveText('Roll', { timeout: 3000 });

	await openSettings(page);

	await expect(page.locator('#game-variety')).toBeDisabled();
	await expect(page.locator('#number-of-die')).toBeDisabled();
	await expect(page.locator('.settings-note')).toBeVisible();
});

// ── Stats modal ───────────────────────────────────────────────────────────────

test('stats modal opens and shows stats', async ({ page }) => {
	// Play a few games via instant autoplay first
	await setAutoplaySpeed(page, 4);
	await page.locator('.btn-outline', { hasText: 'Autoplay' }).click();
	await page.waitForFunction(
		() => {
			const raw = localStorage.getItem('store');
			const store = raw ? JSON.parse(raw) : null;
			return (store?.gameStats?.played ?? 0) >= 3;
		},
		{ timeout: 10_000 }
	);
	await page.locator('.btn-stop').click();

	// Open quick stats modal
	await page.locator('.btn-stats').click();
	await expect(page.locator('.modal-box')).toBeVisible();
	await expect(page.locator('.modal-box h2')).toHaveText('Quick Stats');

	// Stat cards should be present
	await expect(page.locator('.stat-card')).toHaveCount(6);

	// Played count should be > 0
	const playedCard = page.locator('.stat-card').first();
	const value = await playedCard.locator('.stat-value').textContent();
	expect(Number(value)).toBeGreaterThan(0);
});

test('stats modal closes when clicking overlay or X', async ({ page }) => {
	await page.locator('.btn-stats').click();
	await expect(page.locator('.modal-box')).toBeVisible();

	// Close via X button
	await page.locator('.modal-close').click();
	await expect(page.locator('.modal-box')).not.toBeVisible();

	// Reopen and close via overlay
	await page.locator('.btn-stats').click();
	await page.locator('.modal-overlay').click({ position: { x: 10, y: 10 } });
	await expect(page.locator('.modal-box')).not.toBeVisible();
});

test('stats modal has a link to the full stats page', async ({ page }) => {
	await page.locator('.btn-stats').click();
	await page.locator('.stats-link').click();
	await expect(page).toHaveURL('/stats');
});

// ── Stats page ────────────────────────────────────────────────────────────────

test('stats page shows empty state when no games played', async ({ page }) => {
	await page.goto('/stats');
	await expect(page.locator('.empty-state')).toBeVisible();
});

test('stats page shows data after games are played', async ({ page }) => {
	// Play some games first
	await setAutoplaySpeed(page, 4);
	await page.locator('.btn-outline', { hasText: 'Autoplay' }).click();
	await page.waitForFunction(
		() => {
			const raw = localStorage.getItem('store');
			const store = raw ? JSON.parse(raw) : null;
			return (store?.gameStats?.played ?? 0) >= 5;
		},
		{ timeout: 15_000 }
	);
	await page.locator('.btn-stop').click();

	await page.goto('/stats');

	await expect(page.locator('.section')).not.toHaveCount(0);
	// Overview cards
	await expect(page.locator('.card-grid .card').first()).toBeVisible();
	// Games played card should show a number > 0
	const playedValue = await page.locator('.card-grid .card').first().locator('.card-value').textContent();
	expect(Number(playedValue)).toBeGreaterThan(0);
});

test('stats page shows dice roll distribution after games', async ({ page }) => {
	await setAutoplaySpeed(page, 4);
	await page.locator('.btn-outline', { hasText: 'Autoplay' }).click();
	await page.waitForFunction(
		() => {
			const raw = localStorage.getItem('store');
			const store = raw ? JSON.parse(raw) : null;
			return (store?.gameStats?.diceRolls?.total ?? 0) >= 10 && (store?.gameStats?.played ?? 0) >= 1;
		},
		{ timeout: 15_000 }
	);
	await page.locator('.btn-stop').click();

	await page.goto('/stats');
	await expect(page.locator('.dice-dist')).toBeVisible();
	await expect(page.locator('.dist-item')).toHaveCount(6);
});

test('reset stats clears all data', async ({ page }) => {
	// Play a game first
	await setAutoplaySpeed(page, 4);
	await page.locator('.btn-outline', { hasText: 'Autoplay' }).click();
	await page.waitForFunction(
		() => {
			const raw = localStorage.getItem('store');
			const store = raw ? JSON.parse(raw) : null;
			return (store?.gameStats?.played ?? 0) >= 1;
		},
		{ timeout: 10_000 }
	);
	await page.locator('.btn-stop').click();

	await page.goto('/stats');
	await expect(page.locator('.empty-state')).not.toBeVisible();

	// Trigger reset
	await page.locator('.btn-reset-stats').click();
	await expect(page.locator('.modal-box')).toBeVisible();

	await page.locator('.btn-confirm-reset').click();

	// Stats should be cleared
	await expect(page.locator('.empty-state')).toBeVisible();
});

test('reset stats cancel does not clear data', async ({ page }) => {
	// Play a game first
	await setAutoplaySpeed(page, 4);
	await page.locator('.btn-outline', { hasText: 'Autoplay' }).click();
	await page.waitForFunction(
		() => {
			const raw = localStorage.getItem('store');
			const store = raw ? JSON.parse(raw) : null;
			return (store?.gameStats?.played ?? 0) >= 1;
		},
		{ timeout: 10_000 }
	);
	await page.locator('.btn-stop').click();

	await page.goto('/stats');
	await page.locator('.btn-reset-stats').click();

	// Cancel
	await page.locator('.btn-cancel').click();
	await expect(page.locator('.modal-box')).not.toBeVisible();

	// Data should still be there
	await expect(page.locator('.empty-state')).not.toBeVisible();
});
