/*
 * 列自适应
 * */
import utils from '../../src/utils/utils.js';

export default {

  data () {
    return {
      resizeColumns: [], // 所有需要自适应的列集合
      initTotalColumnsWidth: 0, // 所有列初始化时的总宽度
      hasContainerWidth: false, // 容器是否有宽度（display：none 时没有）
      containerWidthCheckTimer: null,
    };
  },

  methods: {
        // 获取所有自适应列的集合
    getResizeColumns () {
      const result = [];

      this.columns_.forEach(item => {
        if (item.isResize) {
          result.push({ width: item.width, field: item.field });
        }
      });

      this.resizeColumns = result;
    },

        // 初始化
    initResizeColumns () {
      this.initTotalColumnsWidth = this.totalColumnsWidth;
      this.getResizeColumns();
    },

        // 如果初始化时document上包含滚动条，渲染完document滚动条消失会造成表格宽度计算有误的问题
    containerWidthCheck () {
      this.containerWidthCheckTimer = setTimeout(x => {
        const tableContainerWidth = this.$el.clientWidth;

            // 3为容错值
        if (tableContainerWidth - this.width_ > 3) {
          this.tableResize();
        }
      });
    },

        // 目前适用于有横向自适应功能的表格
    adjustHeight (hasScrollBar) {
      if (!this.$el || this.isVerticalResize) {
        return false;
      }

      const totalColumnsHeight = this.getTotalColumnsHeight();
      const scrollbarWidth = this.scrollbarWidth;

            // 有footer 功能
      if (this.hasTableFooter) {
        if (hasScrollBar) {
          if (this.footerTotalHeight === this.getFooterTotalRowHeight) {
            this.footerTotalHeight += scrollbarWidth;

            if (!(this.height && this.height > 0) || this.height > totalColumnsHeight) {
              this.height_ += scrollbarWidth;
            }
          }
        } else if (!hasScrollBar) {
          if (this.footerTotalHeight > this.getFooterTotalRowHeight) {
            this.footerTotalHeight -= scrollbarWidth;

            if (!(this.height && this.height > 0) || this.height > totalColumnsHeight) {
              this.height_ -= scrollbarWidth;
            }
          }
        }
      } else if (!(this.height && this.height > 0) || this.height > totalColumnsHeight) { // 当没有设置高度时计算总高度 || 设置的高度大于所有列高度之和时
        if (hasScrollBar && this.height_ + 2 < totalColumnsHeight + scrollbarWidth) {
          this.height_ += scrollbarWidth;
        } else if (!hasScrollBar) {
          this.height_ = this.getTotalColumnsHeight();
        }
      }
    },

        // 随着窗口改变表格自适应
    tableResize () {
      if (!this.isHorizontalResize && !this.isVerticalResize) {
        return false;
      }

      const totalColumnsHeight = this.getTotalColumnsHeight();
      const maxWidth = this.maxWidth; // 5000
      const maxHeight = (this.height && this.height > 0) ? this.height : totalColumnsHeight; // 取 Math.min(height, totalHeight)，也就是以用户设置的高度为主
      const minWidth = this.minWidth; // 50
      const minHeight = this.minHeight > totalColumnsHeight ? totalColumnsHeight : this.minHeight; // 取 Math.max(minHeight, totalHeight)
      const view = this.$el; // div.table__overflow
      const viewOffset = utils.getViewportOffset(view);
      let currentWidth = view.getBoundingClientRect !== 'undefined' ? view.getBoundingClientRect().width : view.clientWidth;
      let currentHeight = view.getBoundingClientRect !== 'undefined' ? view.getBoundingClientRect().height : view.clientHeight;
                // right = window.document.documentElement.clientWidth - currentWidth - viewOffset.left;
      let bottom = window.document.documentElement.clientHeight - currentHeight - viewOffset.top - 2; // 元素最底端距离文档底端的距离
      let bottom2 = viewOffset.bottom2; // bottom2：元素最底端距离文档最底部的距离
      const scrollbarWidth = this.scrollbarWidth;


      if (this.isHorizontalResize && this.width_ && this.width_ > 0 && currentWidth > 0) {
        currentWidth = Math.min(currentWidth, maxWidth);
        currentWidth = Math.max(currentWidth, minWidth);

        this.width_ = currentWidth;
      }

      if (this.isVerticalResize && currentHeight > 0) {
        bottom -= this.verticalResizeOffset;

        currentHeight += bottom;// - this.VerticalResizeOffset;
        currentHeight = currentHeight > maxHeight ? maxHeight : currentHeight;
        currentHeight = currentHeight < minHeight ? minHeight : currentHeight;

                // 有横向滚动条
        if (currentWidth <= this.initTotalColumnsWidth && !this.isTableEmpty) {
          bottom2 -= this.verticalResizeOffset;

          const differ = bottom2 - totalColumnsHeight;

                    // 高度足够（table 顶部到文档底部的高度 > 表格高度+滚动条高度）
          if (bottom2 > totalColumnsHeight + scrollbarWidth) {
            currentHeight += scrollbarWidth;
          } else if (differ > 0 && differ < scrollbarWidth) {
            currentHeight += differ;
          }
        }

        this.height_ = currentHeight;
      }

      this.changeColumnsWidth(currentWidth);
    },

        // 改变所有需要自适应列的宽度
    changeColumnsWidth (currentWidth) {
      let differ = currentWidth - this.totalColumnsWidth;
      const initResizeWidths = this.initTotalColumnsWidth;
      const rightViewBody = this.$el.querySelector('.v-table-rightview .v-table-body');
      const rightViewFooter = this.$el.querySelector('.v-table-rightview .v-table-footer');


      if (currentWidth <= initResizeWidths && !this.isTableEmpty) { // 排除表格无数据的影响
        if (this.hasTableFooter) {
          rightViewFooter.style.overflowX = 'scroll';
        } else {
          rightViewBody.style.overflowX = 'scroll';
        }

        this.adjustHeight(true);
      } else {
                // 防止最后一列右距中时内容显示不全
        if (this.getTotalColumnsHeight() > this.height_) {
          differ -= this.scrollbarWidth;
        }

        if (this.hasTableFooter) {
          rightViewFooter.style.overflowX = 'hidden';
        } else {
          rightViewBody.style.overflowX = 'hidden';
        }

        this.adjustHeight(false);
      }

      if (this.hasFrozenColumn) {
        differ -= 1;
      }

      if (currentWidth >= initResizeWidths || differ > 0) {
        this.setColumnsWidth(differ);
      } else { // 最小化有滚动条时
        this.columns.forEach((col, index) => {
          if (col.isResize) {
            this.columns_[index].width = col.width;
          }
        });
      }

      this.containerWidthCheck();
    },

        /*
         * 自适应时给列设置宽度
         * 备注：浏览器 px 必须精确多整数
         * */
    setColumnsWidth (differ) {
      const resizeColumnsLen = this.resizeColumns.length;
      const average = Math.floor(differ / resizeColumnsLen);
      const totalAverage = average * resizeColumnsLen;
      const leftAverage = differ - totalAverage;
      const leftAverageFloor = Math.floor(leftAverage);
      const averageColumnsWidthArr = (new Array(resizeColumnsLen)).fill(average);
      let index = 0;

            // 剩余的宽度以整数的形式平均到每个列
      for (let i = 0; i < leftAverageFloor; i++) {
        averageColumnsWidthArr[i] += 1;
      }

            // 剩余的小数给最后一列
      averageColumnsWidthArr[resizeColumnsLen - 1] += (leftAverage - leftAverageFloor);

      this.columns_.map(item => {
        if (item.isResize) {
          item.width += averageColumnsWidthArr[index++];
        }

        return item;
      });
    },
  },

  mounted () {
    utils.bind(window, 'resize', this.tableResize);
  },
  beforeDestroy () {
    utils.unbind(window, 'resize', this.tableResize);
    clearTimeout(this.containerWidthCheckTimer);
  },

};
