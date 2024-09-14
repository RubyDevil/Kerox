"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressBar = void 0;
class ProgressBar {
    get cells() { return this.width - 2; }
    get progress() { return this.value / this.max; }
    get percentage() { return (this.value / this.max * 100).toFixed(2) + '%'; }
    constructor(width, max = 1, duration) {
        this.width = width;
        this.max = max;
        this.duration = duration;
        this.bar = '';
        this.width = width;
        this.max = max;
        this.value = 0;
        this.updateBar();
    }
    update(value) {
        this.value = value;
        this.updateBar();
    }
    updateBar() {
        let filled = Math.floor(this.progress * this.cells);
        let empty = this.cells - filled;
        try {
            this.bar = this.draw(filled, empty);
        }
        catch (_a) {
            this.bar = this.draw(0, this.cells);
        }
    }
    draw(filled, empty) {
        return (ProgressBar.icons.left +
            ProgressBar.icons.filled.repeat(filled) +
            ProgressBar.icons.empty.repeat(empty) +
            ProgressBar.icons.right).trim();
    }
}
exports.ProgressBar = ProgressBar;
ProgressBar.icons = {
    filled: '∎',
    empty: '□',
    left: '[',
    right: ']',
};
/*left: '▰', right: '▱'*/ 
//# sourceMappingURL=ProgressBar.js.map