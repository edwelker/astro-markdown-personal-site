import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mainLinks, secondaryLinks } from '../src/lib/nav-links';
import { initMenuModal } from '../src/lib/menu-modal';

describe('Navigation Links', () => {
  it('should have Media as the last item in secondary links', () => {
    const lastLink = secondaryLinks[secondaryLinks.length - 1];
    expect(lastLink.label).toBe('Media');
    expect(lastLink.href).toBe('/media/');
  });

  it('should have expected main links', () => {
    const labels = mainLinks.map(l => l.label);
    expect(labels).toContain('About');
    expect(labels).toContain('Blog');
    expect(labels).toContain('Music');
    expect(labels).not.toContain('Media'); // Moved to secondary
  });

  it('should have expected secondary links', () => {
    const labels = secondaryLinks.map(l => l.label);
    expect(labels).toContain('GasPrices');
    expect(labels).toContain('Sports');
    expect(labels).toContain('Uses');
    expect(labels).toContain('Media');
  });
});

describe('Menu Modal Logic', () => {
  let events: Record<string, (e?: any) => void>;
  let mockDialog: any;
  let mockBtn: any;
  let mockCloseBtn: any;
  let mockLink: any;

  beforeEach(() => {
    events = {};

    // Helper to simulate event listeners
    const addEventListener = (id: string) => vi.fn((event: string, callback: any) => {
      events[`${id}:${event}`] = callback;
    });

    mockLink = {
      addEventListener: addEventListener('link'),
      click: () => events['link:click'] && events['link:click'](),
    };

    mockDialog = {
      showModal: vi.fn(),
      close: vi.fn(),
      getBoundingClientRect: vi.fn(() => ({
        top: 0, left: 0, width: 100, height: 100, bottom: 100, right: 100, x: 0, y: 0, toJSON: () => {}
      })),
      addEventListener: addEventListener('menu-dialog'),
      querySelectorAll: vi.fn(() => [mockLink]),
    };

    mockBtn = {
      addEventListener: addEventListener('menu-btn'),
      click: () => events['menu-btn:click'] && events['menu-btn:click'](),
    };

    mockCloseBtn = {
      addEventListener: addEventListener('menu-close'),
      click: () => events['menu-close:click'] && events['menu-close:click'](),
    };

    vi.stubGlobal('document', {
      getElementById: vi.fn((id) => {
        if (id === 'menu-dialog') return mockDialog;
        if (id === 'menu-btn') return mockBtn;
        if (id === 'menu-close') return mockCloseBtn;
        return null;
      })
    });

    initMenuModal('menu-btn', 'menu-dialog', 'menu-close');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('opens modal on button click', () => {
    mockBtn.click();
    expect(mockDialog.showModal).toHaveBeenCalled();
  });

  it('closes modal on close button click', () => {
    mockCloseBtn.click();
    expect(mockDialog.close).toHaveBeenCalled();
  });

  it('closes modal on link click', () => {
    mockLink.click();
    expect(mockDialog.close).toHaveBeenCalled();
  });

  it('closes modal when clicking outside the dialog content', () => {
    // Simulate click event handler on dialog
    const clickHandler = events['menu-dialog:click'];
    expect(clickHandler).toBeDefined();
    
    // Click at 150, 150 (outside 0,0-100,100 rect)
    clickHandler({ clientX: 150, clientY: 150 });
    expect(mockDialog.close).toHaveBeenCalled();
  });

  it('does not close modal when clicking inside the dialog content', () => {
    const clickHandler = events['menu-dialog:click'];
    expect(clickHandler).toBeDefined();

    // Click at 50, 50 (inside 0,0-100,100 rect)
    clickHandler({ clientX: 50, clientY: 50 });
    expect(mockDialog.close).not.toHaveBeenCalled();
  });
});

describe('Menu Modal Safety', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should safely handle missing elements', () => {
    // Mock document to return null for everything
    vi.stubGlobal('document', {
      getElementById: vi.fn(() => null)
    });

    // Should not throw error
    expect(() => initMenuModal('missing', 'missing', 'missing')).not.toThrow();
  });
});
