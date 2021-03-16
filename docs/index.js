function _handleMouseWheel(event) {
  event.preventDefault();
}

function _handleTouchMove(event) {
  event.preventDefault();
}

function lockScroll() {
  // PCはoverflow: hiddenだけで良さそう
  // document.addEventListener('mousewheel', _handleMouseWheel, { passive: false });
  document.addEventListener('touchmove', _handleTouchMove, { passive: false });
  document.body.style.overflow = 'hidden';
}

function unLockScroll() {
  // document.removeEventListener('mousewheel', _handleMouseWheel, { passive: false });
  document.removeEventListener('touchmove', _handleTouchMove, { passive: false });
  document.body.style.overflow = '';
}

const elModalOpenButton = document.getElementById('modal-open-button');
const elModal = document.getElementById('modal');
const elModalBackground = document.getElementById('modal-background');
const elScrollers = document.querySelectorAll('.js-scroll');

elModalOpenButton.addEventListener('click', () => {
  lockScroll();
  elModal.setAttribute('aria-hidden', false);
});

elModalBackground.addEventListener('click', () => {
  unLockScroll();
  elModal.setAttribute('aria-hidden', true);
});

/**
 * スクロールの設定
 */

class Scroller {
  /**
   * @param {HTMLElement} elScroller - スクロール要素
   */
  constructor(elScroller) {
    this.elScroller = elScroller;
    this.touchStartTime = -1;
    this.startScrollTop = undefined;
    this.touchStartY = undefined;
    this.velocityY = 0;
    this.animationFrame = undefined;

    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);
    this.onAnimationFrame = this.onAnimationFrame.bind(this);
    this.setup();
  }

  setup() {
    this.elScroller.addEventListener('touchstart', this._onTouchStart);
    document.addEventListener('touchmove', this._onTouchMove, { passive: false });
    document.addEventListener('touchend', this._onTouchEnd);
  }

  destroy() {
    this.elScroller.removeEventListener('touchstart', this._onTouchStart);
    document.removeEventListener('touchmove', this._onTouchMove, { passive: false });
    document.removeEventListener('touchend', this._onTouchEnd);
  }

  _onTouchStart(event) {
    if (this.animationFrame != null) {
      window.cancelAnimationFrame(this.animationFrame);
    }

    this.touchStartTime = performance.now();
    this.touchStartY = ('touches' in event) ? event.touches[0].screenY : event.pageY;
    this.startScrollTop = this.elScroller.scrollTop;
  }

  _onTouchMove(event) {
    if (this.touchStartY == null || this.startScrollTop == null) {
      return;
    }
    event.preventDefault();

    const posY = ('touches' in event) ? event.touches[0].screenY : event.pageY;
    this.elScroller.scrollTop = this.startScrollTop + (this.touchStartY - posY);
  }

  _onTouchEnd() {
    if (this.touchStartY == null || this.startScrollTop == null) {
      return;
    }

    const diffTime = performance.now() - this.touchStartTime;

    this.velocityY = 30 * (this.elScroller.scrollTop - this.startScrollTop) / diffTime;
    this.touchStartY = undefined;
    this.startScrollTop = undefined;
    this.touchStartTime = undefined;
    this.animationFrame = window.requestAnimationFrame(this.onAnimationFrame);
  }

  onAnimationFrame() {
    this.elScroller.scrollTop += this.velocityY;
    this.velocityY *= 0.9;
    if (Math.abs(this.velocityY) > 1) {
      this.animationFrame = window.requestAnimationFrame(this.onAnimationFrame);
    }
  }
}

elScrollers.forEach((elScroller) => {
  new Scroller(elScroller);
});
