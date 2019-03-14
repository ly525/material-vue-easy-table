/*
 * 排序
 * */
export default {

  data () {
    return {
      sortColumns: {},
    };
  },

  methods: {
        // 是否允许排序
    enableSort (val) {
      return typeof val === 'string';
    },
        // 允许排序的列集合
    setSortColumns () {
      const self = this;
      const sortColumns = {};
      const titleRowsToSortInfo = [];

      if (self.titleRows_.length > 0) {
        self.titleRows_.filter(function (row) {
          row.filter(function (column, index) {
            if (typeof column.orderBy === 'string' && column.fields.length === 1) {
              column.field = column.fields[0];
              titleRowsToSortInfo.push(column);
            }
          });
        });
      }

      const collection = titleRowsToSortInfo.length > 0 ? titleRowsToSortInfo : self.columns_;

      collection.filter(function (item, index) {
        if (self.enableSort(item.orderBy)) {
          sortColumns[item.field] = item.orderBy;
        }
      });

      this.sortColumns = sortColumns;

      this.singleSortInit();
    },

        // 获取当前排序规则
    getCurrentSort (field) {
      return this.sortColumns[field];
    },

        // 排序控制
    sortControl (field) {
      const orderBy = this.sortColumns[field];

      if (this.enableSort(orderBy)) {
        if (this.sortAlways) {
          this.sortColumns[field] = orderBy === 'desc' ? 'asc' : 'desc';
        } else {
          this.sortColumns[field] = orderBy === 'asc' ? 'desc' :
                        (this.sortColumns[field] === 'desc' ? '' : 'asc');
        }

        if (!this.multipleSort) {
          for (const col in this.sortColumns) {
            if (col !== field) {
              this.sortColumns[col] = '';
            }
          }
        }

        this.$emit('sort-change', this.sortColumns);
      }
    },

        // 单排时只允许保留第一个排序规则（‘asc’或者‘desc’）
    singleSortInit () {
      // let self = this,
      //   result = false;

      // if (!self.multipleSort && self.sortColumns) {
      //   for (const col in self.sortColumns) {
      //     if (result) {
      //       self.sortColumns[col] = '';
      //     }
      //     result = true;
      //   }
      // }
    },

        // 对外暴露的方法（重置排序规则）
    resetOrder () {
      this.setSortColumns();

      this.$emit('sort-change', this.sortColumns);
    },
  },
};
