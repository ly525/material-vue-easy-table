/*
 * 鼠标滚动，滚动条改变
 * */

import utils from '../../src/utils/utils.js';
export default {
  methods: {
    body1Mousewheel (e) {
      const body2 = this.$el.querySelector('.v-table-rightview .v-table-body');

      const e1 = e.originalEvent || window.event || e;
      const scrollHeight = e1.wheelDelta || e1.detail * (-1);
      body2.scrollTop -= scrollHeight;
    },

        // 表格内容滚动到顶部（常用与分页）
    bodyScrollTop () {
      const body1 = this.$el.querySelector('.v-table-leftview .v-table-body');
      const body2 = this.$el.querySelector('.v-table-rightview .v-table-body');

      if (body1) {
        body1.scrollTop = 0;
      }
      body2.scrollTop = 0;
    },

    body2Scroll (e) {
      const view2 = this.$el.querySelector('.v-table-rightview');
      const body1 = this.$el.querySelector('.v-table-leftview .v-table-body');
      const body2 = this.$el.querySelector('.v-table-rightview .v-table-body');

      if (body1) {
        body1.scrollTop = body2.scrollTop;
      }


      view2.querySelector('.v-table-header').scrollLeft = body2.scrollLeft;
    },

    rightViewFooterScroll () {
      const view2 = this.$el.querySelector('.v-table-rightview');

      const rightViewFooter = this.$el.querySelector('.v-table-rightview .v-table-footer');

      view2.querySelector('.v-table-header').scrollLeft = rightViewFooter.scrollLeft;
      view2.querySelector('.v-table-body').scrollLeft = rightViewFooter.scrollLeft;
    },

        // 列表中滚动条控制
    scrollControl () {
      this.unbindEvents();

            // 修复左侧固定列绑定滚动事件失效的问题
      setTimeout(x => {
        const body1 = this.$el.querySelector('.v-table-leftview .v-table-body');
        const body2 = this.$el.querySelector('.v-table-rightview .v-table-body');
        const rightViewFooter = this.$el.querySelector('.v-table-rightview .v-table-footer');

        utils.bind(body1, 'mousewheel', this.body1Mousewheel);
        utils.bind(body2, 'scroll', this.body2Scroll);
        utils.bind(rightViewFooter, 'scroll', this.rightViewFooterScroll);
      });
    },

    unbindEvents () {
      const body1 = this.$el.querySelector('.v-table-leftview .v-table-body');
      const body2 = this.$el.querySelector('.v-table-rightview .v-table-body');
      const rightViewFooter = this.$el.querySelector('.v-table-rightview .v-table-footer');

      utils.unbind(body1, 'mousewheel', this.body1Mousewheel);
      utils.unbind(body2, 'scroll', this.body2Scroll);
      utils.unbind(rightViewFooter, 'scroll', this.rightViewFooterScroll);
    },

        // 对外暴露的方法
    scrollToTop () {
      this.bodyScrollTop();
    },
  },

  beforeDestroy () {
    this.unbindEvents();
  },
};
