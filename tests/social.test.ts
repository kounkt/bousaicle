import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildItems } from '../src/data/stockMaster';
import { buildPublicShare, fullShareText, getShareMoment, PUBLIC_APP_URL, shareWithDevice, socialLinks } from '../src/logic/social';
import type { Household } from '../src/types';

const family: Household = { version: 1, prefecture: '非公開の居住地', dwelling: 'house', adults: 2, seniors: 0, kidsInfant: 0, kidsChild: 0, pets: [], flags: { allergy: false, medication: false }, targetDays: 7 };
const stocked = () => buildItems(family).map(i => ({ ...i, ownedQty: i.requiredQty, plan: '非公開の買い物メモ' }));
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('public sharing and milestones', () => {
  it('does not invent a personal achievement for visitors without a saved household', () => {
    expect(getShareMoment(false, stocked())).toBe('intro');
    expect(buildPublicShare('intro', 100).score).toBeUndefined();
  });
  it('celebrates quantities only when water and toilets are both covered', () => {
    expect(getShareMoment(true, stocked())).toBe('basics');
    expect(getShareMoment(true, stocked().map(i => i.id === 'water' ? { ...i, ownedQty: i.requiredQty - 1 } : i))).toBe('started');
    expect(getShareMoment(true, stocked().filter(i => i.id !== 'toilet'))).toBe('started');
    expect(getShareMoment(true, [])).toBe('started');
  });
  it('does not celebrate expired water or an unconfirmed old have checkbox', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 8, 7, 12));
    expect(getShareMoment(true, stocked().map(i => i.id === 'water' ? { ...i, expiry: { year: 2026, month: 9, day: 6 } } : i))).toBe('started');
    expect(getShareMoment(true, stocked().map(i => i.id === 'toilet' ? { ...i, ownedQty: undefined, status: 'have' as const } : i))).toBe('started');
  });
  it('exposes no score by default and includes only an explicitly requested finite aggregate', () => {
    expect(buildPublicShare('started').text).not.toContain('%');
    expect(buildPublicShare('started', 99.9).score).toBe(99);
    expect(buildPublicShare('started', -1).score).toBe(0);
    expect(buildPublicShare('started', 101).score).toBe(100);
    expect(buildPublicShare('started', NaN).score).toBeUndefined();
    expect(buildPublicShare('started', Infinity).score).toBeUndefined();
  });
  it('does not include household details, quantities, free text, or current private URL', () => {
    vi.stubGlobal('location', { href: 'https://chiero.jp/bousaicle/?private=secret#share=family-secret' });
    const share = buildPublicShare(getShareMoment(true, stocked()));
    const outbound = JSON.stringify({ share, text: fullShareText(share), links: socialLinks(share) });
    for (const privateValue of ['非公開', 'family-secret', 'private=secret', 'ownedQty', 'prefecture']) expect(outbound).not.toContain(privateValue);
    expect(share.url).toBe(PUBLIC_APP_URL);
  });
  it('encodes Japanese text and hashtags separately from the clean canonical URL', () => {
    const share = { ...buildPublicShare('started', 42), url: 'https://example.com/#private' };
    const links = socialLinks(share);
    for (const link of Object.values(links)) {
      const url = new URL(link);
      expect(url.searchParams.get('url')).toBe(PUBLIC_APP_URL);
      expect(url.searchParams.get('text')).toBe(share.text);
      expect(url.hash).toBe('');
    }
    expect(fullShareText(share)).not.toContain('private');
  });
  it('keeps every preset below 280 even counting every text character as two plus the shortened URL', () => {
    for (const moment of ['intro', 'started', 'basics'] as const) {
      const share = buildPublicShare(moment, 100);
      expect([...share.text].length * 2 + 24).toBeLessThanOrEqual(280);
    }
  });
});

describe('device sharing', () => {
  it('returns unavailable without a share API', async () => {
    vi.stubGlobal('navigator', {});
    expect(await shareWithDevice(buildPublicShare('intro'))).toBe('unavailable');
  });
  it('hands off only the public payload when invoked', async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { share: send });
    const share = { ...buildPublicShare('started'), url: 'https://example.com/#private' };
    expect(send).not.toHaveBeenCalled();
    expect(await shareWithDevice(share)).toBe('handed-off');
    expect(send.mock.calls[0][0]).toMatchObject({ text: share.text, url: PUBLIC_APP_URL });
    expect(JSON.stringify(send.mock.calls)).not.toContain('private');
  });
  it('treats cancellation as cancellation without a retry or fallback send', async () => {
    const send = vi.fn().mockRejectedValue(new DOMException('Cancelled', 'AbortError'));
    vi.stubGlobal('navigator', { share: send });
    expect(await shareWithDevice(buildPublicShare('intro'))).toBe('cancelled');
    expect(send).toHaveBeenCalledTimes(1);
  });
  it('does not try unsupported file sharing', async () => {
    const send = vi.fn(); const file = new File(['png'], 'card.png', { type: 'image/png' });
    vi.stubGlobal('navigator', { share: send, canShare: () => false });
    expect(await shareWithDevice(buildPublicShare('basics'), file)).toBe('unavailable');
    expect(send).not.toHaveBeenCalled();
  });
  it('hands off a prepared file immediately with the public link included in text', async () => {
    const send = vi.fn().mockResolvedValue(undefined); const file = new File(['png'], 'card.png', { type: 'image/png' });
    vi.stubGlobal('navigator', { share: send, canShare: () => true });
    expect(await shareWithDevice(buildPublicShare('basics'), file)).toBe('handed-off');
    expect(send.mock.calls[0][0].files).toEqual([file]);
    expect(send.mock.calls[0][0].text).toContain(PUBLIC_APP_URL);
  });
  it('propagates a genuine platform error for the UI to explain', async () => {
    vi.stubGlobal('navigator', { share: vi.fn().mockRejectedValue(new Error('Permission denied')) });
    await expect(shareWithDevice(buildPublicShare('intro'))).rejects.toThrow('Permission denied');
  });
});
