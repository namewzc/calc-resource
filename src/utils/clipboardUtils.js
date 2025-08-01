/**
 * 兼容的剪切板工具类
 * 支持现代浏览器的 Clipboard API 和传统的 execCommand 降级方案
 */

class ClipboardUtils {
  /**
   * 检查是否支持现代 Clipboard API
   * @returns {boolean}
   */
  static isClipboardAPISupported() {
    return navigator.clipboard && window.isSecureContext;
  }

  /**
   * 使用现代 Clipboard API 复制文本
   * @param {string} text 要复制的文本
   * @returns {Promise<boolean>}
   */
  static async copyWithClipboardAPI(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Clipboard API failed:', err);
      return false;
    }
  }

  /**
   * 使用传统 execCommand 方法复制文本
   * @param {string} text 要复制的文本
   * @returns {boolean}
   */
  static copyWithExecCommand(text) {
    try {
      // 创建临时文本区域
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // 设置样式使其不可见
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.style.opacity = '0';
      textArea.style.pointerEvents = 'none';
      
      // 添加到DOM
      document.body.appendChild(textArea);
      
      // 选择文本
      textArea.focus();
      textArea.select();
      
      // 执行复制命令
      const successful = document.execCommand('copy');
      
      // 清理
      document.body.removeChild(textArea);
      
      return successful;
    } catch (err) {
      console.warn('execCommand failed:', err);
      return false;
    }
  }

  /**
   * 通用复制文本方法（自动选择最佳方案）
   * @param {string} text 要复制的文本
   * @returns {Promise<boolean>}
   */
  static async copyText(text) {
    if (!text) {
      console.warn('No text provided to copy');
      return false;
    }

    // 优先使用现代 Clipboard API
    if (this.isClipboardAPISupported()) {
      const success = await this.copyWithClipboardAPI(text);
      if (success) {
        return true;
      }
    }

    // 降级到 execCommand
    return this.copyWithExecCommand(text);
  }

  /**
   * 读取剪切板内容（仅支持现代 Clipboard API）
   * @returns {Promise<string|null>}
   */
  static async readText() {
    if (!this.isClipboardAPISupported()) {
      console.warn('Clipboard read not supported in non-secure context');
      return null;
    }

    try {
      const text = await navigator.clipboard.readText();
      return text;
    } catch (err) {
      console.warn('Failed to read clipboard:', err);
      return null;
    }
  }

  /**
   * 检查当前环境的剪切板支持情况
   * @returns {object}
   */
  static getClipboardSupport() {
    return {
      clipboardAPI: this.isClipboardAPISupported(),
      execCommand: document.queryCommandSupported && document.queryCommandSupported('copy'),
      secureContext: window.isSecureContext,
      protocol: window.location.protocol
    };
  }
}

export default ClipboardUtils;
