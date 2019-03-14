/**
  cellMerge(rowIndex, rowData, field) {
    if (field === "name" && rowData[field] === "李伟") {
      return {
        colSpan: 2,
        rowSpan: 1,
        content: '<span style="color:red">单元格 colSpan</span>',
        componentName: ""
      };
    } else if (rowIndex === 3 && field === "gender") {
      return {
        colSpan: 1,
        rowSpan: 3,
        content: '<span style="color:red">单元格 rowSpan</span>',
        componentName: ""
      };
    } else if (rowIndex === 2 && field === "birthday") {
      return {
        colSpan: 2,
        rowSpan: 3,
        content: "",
        componentName: "table-cell-merge"
      };
    }
  }
*/
export default {

  data () {
    return {

            // 跳过渲染的列集合
      skipRenderCells: [],
    };
  },

  methods: {

        /*
         * isFrozenColumns:是否是固定列
         * */
    cellMergeInit (rowIndex, field, rowData, isFrozenColumns) {
            // 包含在 skipRenderCells 内，则不渲染
      if (this.skipRenderCells.indexOf(`${rowIndex}-${field}`) !== -1) {
        return false;
      }

      const setting = this.cellMerge && this.cellMerge(rowIndex, rowData, field);

      if (setting && ((setting.colSpan && setting.colSpan > 1) || (setting.rowSpan && setting.rowSpan > 1))) {
        this.setSkipRenderCells(setting.colSpan, setting.rowSpan, rowIndex, field, isFrozenColumns);
      }

      return true;
    },

        // 设置不渲染的列
    // skipRenderCells demo: [ "1-gender", "4-gender", "5-gender", "3-birthday", "4-birthday", "2-hobby", "3-hobby", "4-hobby" ]
    setSkipRenderCells (colSpan, rowSpan, rowIndex, field, isFrozenColumns) {
      const columnsFields = isFrozenColumns ? this.getFrozenColumnsFields : this.getNoFrozenColumnsFields;
      let skipCell = '';
      const startPosX = columnsFields.indexOf(field);
      let endPosX = columnsFields.indexOf(field);
      if (colSpan && colSpan > 1) {
        endPosX = startPosX + colSpan - 1;
      }

      const startPosY = rowIndex;
      let endPosY = rowIndex;
      if (rowSpan && rowSpan > 1) {
        endPosY = rowIndex + rowSpan - 1;
      }

      for (let posX = startPosX; posX <= endPosX; posX++) {
        for (let posY = startPosY; posY <= endPosY; posY++) {
          if (posX == startPosX && posY == startPosY) {
            continue;
          }

          skipCell = `${posY}-${columnsFields[posX]}`;

                    // 避免状态改变重新渲染的情况
          if (this.skipRenderCells.indexOf(skipCell) === -1) {
            this.skipRenderCells.push(skipCell);
          }
        }
      }
    },

        // 设置 colSpan
    setColRowSpan (rowIndex, field, rowData) {
      let result = { colSpan: '', rowSpan: '' };
      const setting = this.cellMerge && this.cellMerge(rowIndex, rowData, field);

      if (setting) {
        result = {
          colSpan: setting.colSpan ? setting.colSpan : '',
          rowSpan: setting.rowSpan ? setting.rowSpan : '',
        };
      }

      return result;
    },

        /*
         * 并检测不合法的设置，如果设置不合法则不会合并行和列
         * */
    isCellMergeRender (rowIndex, field, rowData) {
      const setting = this.cellMerge && this.cellMerge(rowIndex, rowData, field);

      if (setting && ((setting.colSpan && setting.colSpan > 0) || (setting.rowSpan && setting.rowSpan > 0))) {
        return true;
      }

      return false;
    },

        // 获取行高
    getRowHeightByRowSpan (rowIndex, field, rowData) {
      const setting = this.cellMerge && this.cellMerge(rowIndex, rowData, field);

      if (setting && (setting.rowSpan && setting.rowSpan > 1)) {
        return this.rowHeight * setting.rowSpan;
      }

      return this.rowHeight;
    },

        /*
         * 获取单元格宽度
         * isFrozenColumns:是否是固定列
         * */
    getRowWidthByColSpan (rowIndex, field, rowData) {
      let endPosX;
      let startPosX;
      const columnsFields = this.getColumnsFields;
      const setting = this.cellMerge && this.cellMerge(rowIndex, rowData, field);
      const colSpan = setting.colSpan;
      let totalWidth = 0;

      if (setting && (colSpan && colSpan >= 1)) {
        startPosX = columnsFields.indexOf(field);

        endPosX = startPosX + colSpan - 1;

        for (let i = startPosX; i <= endPosX; i++) {
          this.columns_.forEach(x => {
            if (columnsFields[i] === x.field) {
              totalWidth += x.width;
            }
          });
        }
      }

      return totalWidth;
    },

        // 合并的单元格渲染的内容类型
    /**
      <span v-if="cellMergeContentType(rowIndex, col.field, item).isComponent">
        <component
          :rowData="item"
          :field="col.field ? col.field : ''"
          :index="rowIndex"
          :is="cellMerge(rowIndex, item, col.field).componentName"
          @on-custom-comp="customCompFunc"
        ></component>
      </span>
      <span v-else v-html="cellMerge(rowIndex, item, col.field).content"></span>
     */
    cellMergeContentType (rowIndex, field, rowData) {
      const result = {
        isComponent: false,
        isContent: false,
      };

      const setting = this.cellMerge && this.cellMerge(rowIndex, rowData, field);

      if (setting) {
        if (setting.componentName && typeof setting.componentName === 'string' && setting.componentName.length > 0) {
          result.isComponent = true;
        } else if (setting.content && setting.content.length > 0) {
          result.isContent = true;
        }
      }

      return result;
    },
  },

};
