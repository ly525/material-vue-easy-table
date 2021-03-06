import deepClone from '../../src/utils/deepClone.js';

export default {
  data () {
    return {

      footerTotalHeight: 0,
    };
  },
  computed: {

    frozenFooterCols () {
      const result = [];

      if (this.initInternalFooter.length > 0) {
        this.initInternalFooter.forEach(columns => {
          result.push(columns.filter(col => col.isFrozen));
        });
      }

      return result;
    },

    noFrozenFooterCols () {
      const result = [];

      if (this.initInternalFooter.length > 0) {
        this.initInternalFooter.forEach(columns => {
          result.push(columns.filter(col => !col.isFrozen));
        });
      }

      return result;
    },

    getFooterTotalRowHeight () {
      if (Array.isArray(this.footer) && this.footer.length > 0) {
        return this.footer.length * this.footerRowHeight;
      }
      return 0;
    },

    hasTableFooter () {
      return Array.isArray(this.footer) && this.footer.length;
    },

    initInternalFooter () {
      if (!(Array.isArray(this.footer) && this.footer.length > 0)) {
        return [];
      }

      const result = [];
      let resultRow = [];


            // 防止排序后对原数组进行干扰
      const cloneInternalColumns = deepClone(this.columns_);

      cloneInternalColumns.sort(function (a, b) {
        if (a.isFrozen) {
          return -1;
        } else if (b.isFrozen) {
          return 1;
        }
        return 0;
      });

      this.footer.forEach((items, rows) => {
        resultRow = [];

        items.forEach((value, index) => {
          resultRow.push({
            content: value,
            width: cloneInternalColumns[index].width,
            align: cloneInternalColumns[index].columnAlign,
            isFrozen: !!cloneInternalColumns[index].isFrozen,
          });
        });

        result.push(resultRow);
      });
      return result;
    },
  },

  methods: {

        // 设置 footer 单元格样式
    setFooterCellClassName (isLeftView, rowIndex, colIndex, value) {
      let _colIndex = colIndex;

            // 如果是右列，并且有固定列
      if (!isLeftView && this.hasFrozenColumn) {
        _colIndex += this.frozenCols.length;
      }

      return this.footerCellClassName && this.footerCellClassName(rowIndex, _colIndex, value);
    },
  },

};
