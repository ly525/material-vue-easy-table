<template>
  <div class="v-table__overflow">
    <div class="v-table-views v-table-class we-table theme--light"
         :style="{'width': width_+'px', 'height': getTableHeight+'px','background-color':tableBgColor}">
        <!--左列-->
        <template v-if="frozenCols.length > 0">
          <div class="v-table-leftview" :style="{'width':leftViewWidth+'px'}">
            <!--左列头-->
            <div class="v-table-header v-table-title-class"
                  :style="{'width': leftViewWidth+'px','background-color':titleBgColor}">
                <div class="v-table-header-inner" style="display: block;">
                    <table class="v-table-htable" border="0" cellspacing="0" cellpadding="0">
                        <tbody>

                        <template v-if="frozenTitleCols.length > 0">
                            <tr v-for="(row, rowIndex) in frozenTitleCols" :key="rowIndex">
                                <td v-for="(col, colIndex) in row"
                                    :key="colIndex"
                                    :class="[col.titleCellClassName]"
                                    :colspan="col.colspan" :rowspan="col.rowspan"

                                    @mousemove.stop="handleTitleMouseMove($event,col.fields)"
                                    @mousedown.stop="handleTitleMouseDown($event)"
                                    @mouseout.stop="handleTitleMouseOut()"
                                    @click.stop="titleCellClick(col.fields,col.title);"
                                    @dblclick.stop="titleCellDblClick(col.fields,col.title)">
                                    <div :class="['v-table-title-cell',showVerticalBorder?'vertical-border':'',showHorizontalBorder?'horizontal-border':'']"
                                          :style="{'width':titleColumnWidth(col.fields)+'px','height':titleColumnHeight(col.rowspan)+'px','text-align':col.titleAlign}">
                                        <span class="table-title">
                                            <span v-if="isSelectionCol(col.fields)">
                                                  <v-checkbox
                                                          @change="handleCheckAll"
                                                          :indeterminate="indeterminate"
                                                          v-model="isAllChecked"
                                                          :show-slot="false"
                                                          label="check-all"
                                                  ></v-checkbox>
                                            </span>
                                            <span v-else v-html="col.title"></span>
                                            <span @click.stop="sortControl(col.fields[0])"
                                                  class="v-table-sort-icon" v-if="enableSort(col.orderBy)">
                                                    <i :class='["v-icon-up-dir",getCurrentSort(col.fields[0]) ==="asc" ? "checked":""]'></i>
                                                    <i :class='["v-icon-down-dir",getCurrentSort(col.fields[0]) ==="desc" ? "checked":""]'></i>
                                            </span>
                                        </span>
                                        <!--filters-->
                                        <v-dropdown class="v-table-dropdown" v-if="enableFilters(col.filters,col.fields)"
                                                    v-model="col.filters"
                                                    :show-operation="col.filterMultiple"
                                                    :is-multiple="col.filterMultiple"
                                                    @on-filter-method="filterEvent"
                                                    @change="filterConditionChange(col.filterMultiple)"
                                        >
                                            <i :class="['v-table-filter-icon',vTableFiltersIcon(col.filters)]"></i>
                                        </v-dropdown>
                                    </div>
                                </td>
                            </tr>
                        </template>

                        <template v-else>
                            <tr class="v-table-header-row">
                                <td v-for="(col, colIndex) in frozenCols"
                                    :key="colIndex"
                                    :class="[col.titleCellClassName]"
                                    @mousemove.stop="handleTitleMouseMove($event,col.field)"
                                    @mousedown.stop="handleTitleMouseDown($event)"
                                    @mouseout.stop="handleTitleMouseOut()"
                                    @click.stop="titleCellClick(col.field,col.title);"
                                    @dblclick.stop="titleCellDblClick(col.field,col.title)">
                                    <div :class="['v-table-title-cell',showVerticalBorder?'vertical-border':'',showHorizontalBorder?'horizontal-border':'']"
                                          :style="{'width':col.width+'px','height':titleRowHeight+'px','text-align':col.titleAlign}">
                                            <span class="table-title">
                                                  <span v-if="col.type === 'selection'">
                                                      <v-checkbox
                                                              @change="handleCheckAll"
                                                              :indeterminate="indeterminate"
                                                              v-model="isAllChecked"
                                                              :show-slot="false"
                                                              label="check-all"
                                                      ></v-checkbox>
                                                </span>
                                                <span v-else v-html="col.title"></span>
                                                <span @click.stop="sortControl(col.field)"
                                                      class="v-table-sort-icon" v-if="enableSort(col.orderBy)">
                                                        <i :class='["v-icon-up-dir",getCurrentSort(col.field) ==="asc" ? "checked":""]'></i>
                                                        <i :class='["v-icon-down-dir",getCurrentSort(col.field) ==="desc" ? "checked":""]'></i>
                                                </span>
                                            </span>
                                            <!--filters-->
                                            <v-dropdown class="v-table-dropdown" v-if="enableFilters(col.filters)"
                                                        v-model="col.filters"
                                                        :show-operation="col.filterMultiple"
                                                        :is-multiple="col.filterMultiple"
                                                        @on-filter-method="filterEvent"
                                                        @change="filterConditionChange(col.filterMultiple)"
                                            >
                                                <i :class="['v-table-filter-icon',vTableFiltersIcon(col.filters)]"></i>
                                            </v-dropdown>
                                    </div>
                                </td>
                            </tr>
                        </template>
                        </tbody>
                    </table>
                </div>
            </div>


            <!--左列内容-->
            <div class="v-table-body v-table-body-class"
                  :style="{'width': leftViewWidth+'px', 'height': bodyViewHeight+'px'}">
                <div :class="['v-table-body-inner',vTableBodyInner]">
                    <v-checkbox-group v-model="checkboxGroupModel" @change="handleCheckGroupChange">
                        <table class="v-table-btable" cellspacing="0" cellpadding="0" border="0">
                            <tbody>
                            <tr v-for="(item, rowIndex) in tableData_"
                                :key="rowIndex"
                                class="v-table-row"
                                :style="[trBgColor(rowIndex+1)]"
                                @mouseenter.stop="handleMouseEnter(rowIndex)"
                                @mouseleave.stop="handleMouseOut(rowIndex)">
                                <td v-if="cellMergeInit(rowIndex, col.field, item, true)"
                                    v-for="(col,colIndex) in frozenCols"
                                    :key="colIndex"
                                    :colSpan="setColRowSpan(rowIndex,col.field,item).colSpan"
                                    :rowSpan="setColRowSpan(rowIndex,col.field,item).rowSpan"
                                    :class="[setColumnCellClassName(rowIndex,col.field,item)]">
                                    <!--存在列合并-->
                                    <div v-if="isCellMergeRender(rowIndex,col.field,item)"
                                          :class="['v-table-body-cell',showVerticalBorder ? 'vertical-border':'',showHorizontalBorder?'horizontal-border':'']"
                                          :style="{'width':getRowWidthByColSpan(rowIndex,col.field,item)+'px','height': getRowHeightByRowSpan(rowIndex,col.field,item)+'px','line-height':getRowHeightByRowSpan(rowIndex,col.field,item)+'px','text-align':col.columnAlign}"
                                          :title="col.overflowTitle ?  overflowTitle(item,rowIndex,col) :''"
                                          @click.stop="rowCellClick(rowIndex,item,col, $event);cellEditClick($event,col.isEdit,item,col.field,rowIndex)"
                                          @dblclick.stop="rowCellDbClick(rowIndex,item,col)"
                                    >
                                    <span v-if="cellMergeContentType(rowIndex,col.field,item).isComponent">
                                        <component :rowData="item" :field="col.field ? col.field : ''"
                                                    :index="rowIndex"
                                                    :is="cellMerge(rowIndex,item,col.field).componentName"
                                                    @on-custom-comp="customCompFunc"></component>
                                    </span>
                                        <span v-else v-html="cellMerge(rowIndex,item,col.field).content"></span>
                                    </div>
                                    <!--不存在列合并-->
                                    <div v-else
                                          :class="['v-table-body-cell',showVerticalBorder ? 'vertical-border':'',showHorizontalBorder?'horizontal-border':'']"
                                          :style="{'width':col.width+'px','height': rowHeight+'px','line-height':rowHeight+'px','text-align':col.columnAlign}"
                                          :title="col.overflowTitle ?  overflowTitle(item,rowIndex,col) :''"
                                          @click.stop="rowCellClick(rowIndex,item,col, $event);cellEditClick($event,col.isEdit,item,col.field,rowIndex)"
                                          @dblclick.stop="rowCellDbClick(rowIndex,item,col)"
                                    >
                                    <span v-if="typeof col.componentName ==='string' && col.componentName.length > 0">
                                        <component :rowData="item" :field="col.field ? col.field : ''"
                                                    :index="rowIndex" :is="col.componentName"
                                                    @on-custom-comp="customCompFunc"></component>
                                    </span>
                                        <span v-else-if="typeof col.formatter==='function'"
                                              v-html="col.formatter(item,rowIndex,pagingIndex,col.field)"></span>
                                        <span v-else-if="col.type === 'selection'">
                                        <v-checkbox @change="handleCheckChange(item)" :show-slot="false"
                                                    :disabled="item._disabled" :label="rowIndex"></v-checkbox>
                                    </span>
                                        <span v-else>
                                            {{item[col.field]}}
                                    </span>
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </v-checkbox-group>
                </div>
            </div>

            <!--footer-->
            <div v-if="frozenFooterCols.length > 0"
                  :class="['v-table-footer','v-table-footer-class']"
                  :style="{'width': leftViewWidth+'px','height':footerTotalHeight}">
                <table class="v-table-ftable" cellspacing="0" cellpadding="0" border="0">
                    <tr class="v-table-row" v-for="(item,rowIndex) in frozenFooterCols" :key="rowIndex">
                        <td v-for="(col, colIndex) in item"
                            :key="colIndex"
                            :class="setFooterCellClassName(true,rowIndex,colIndex,col.content)">
                            <div :style="{'height':footerRowHeight+'px','line-height':footerRowHeight+'px','width':col.width+'px','text-align':col.align}"
                                  :class="['v-table-body-cell',vTableBodyCell]"
                                  v-html="col.content"></div>
                        </td>
                    </tr>
                </table>
            </div>
          </div>
        </template>

        <!--右列-->
        <div class="v-table-rightview"
             :style="{'width': rightViewWidth+'px'}">
            <!--右列头-->
            <div class="v-table-header v-table-title-class"
                 :style="{'width': (rightViewWidth-1)+'px','background-color':titleBgColor}">
                <div class="v-table-header-inner" style="display: block;">
                    <table class="v-table-htable" border="0" cellspacing="0" cellpadding="0">
                        <tbody>

                        <template v-if="noFrozenTitleCols.length > 0">
                            <tr v-for="(row, rowIndex) in noFrozenTitleCols" :key="rowIndex">
                                <td v-for="(col, colIndex) in row"
                                    :key="colIndex"
                                    :class="[col.titleCellClassName]"
                                    :colspan="col.colspan" :rowspan="col.rowspan"
                                    @mousemove.stop="handleTitleMouseMove($event,col.fields)"
                                    @mousedown.stop="handleTitleMouseDown($event)"
                                    @mouseout.stop="handleTitleMouseOut()"
                                    @click.stop="titleCellClick(col.fields,col.title);"
                                    @dblclick.stop="titleCellDblClick(col.fields,col.title)">
                                    <div :class="['v-table-title-cell',showVerticalBorder?'vertical-border':'',showHorizontalBorder?'horizontal-border':'']"
                                         :style="{'width':titleColumnWidth(col.fields)+'px','height':titleColumnHeight(col.rowspan)+'px','text-align':col.titleAlign}">
                                        <span class="table-title">
                                          <span v-if="isSelectionCol(col.fields)">
                                                 <v-checkbox
                                                         @change="handleCheckAll"
                                                         :indeterminate="indeterminate"
                                                         v-model="isAllChecked"
                                                         :show-slot="false"
                                                         label="check-all"
                                                 ></v-checkbox>
                                            </span>
                                            <span v-else v-html="col.title"></span>
                                            <span @click.stop="sortControl(col.fields[0])"
                                                  class="v-table-sort-icon" v-if="enableSort(col.orderBy)">
                                                        <i :class='["v-icon-up-dir",getCurrentSort(col.fields[0]) ==="asc" ? "checked":""]'></i>
                                                        <i :class='["v-icon-down-dir",getCurrentSort(col.fields[0]) ==="desc" ? "checked":""]'></i>
                                            </span>
                                        </span>
                                        <!--filters-->
                                        <v-dropdown class="v-table-dropdown" v-if="enableFilters(col.filters,col.fields)"
                                                    v-model="col.filters"
                                                    :show-operation="col.filterMultiple"
                                                    :is-multiple="col.filterMultiple"
                                                    @on-filter-method="filterEvent"
                                                    @change="filterConditionChange(col.filterMultiple)"
                                        >
                                            <i :class="['v-table-filter-icon',vTableFiltersIcon(col.filters)]"></i>
                                        </v-dropdown>
                                    </div>
                                </td>
                            </tr>
                        </template>

                        <template v-else>
                            <tr class="v-table-header-row">
                                <td v-for="(col, colIndex) in noFrozenCols"
                                    :key="colIndex"
                                    :class="[col.titleCellClassName]"
                                    @mousemove.stop="handleTitleMouseMove($event,col.field)"
                                    @mousedown.stop="handleTitleMouseDown($event)"
                                    @mouseout.stop="handleTitleMouseOut()"
                                    @click.stop="titleCellClick(col.field,col.title);"
                                    @dblclick.stop="titleCellDblClick(col.field,col.title)">
                                    <div :class="['v-table-title-cell',showVerticalBorder?'vertical-border':'',showHorizontalBorder?'horizontal-border':'']"
                                         :style="{'width':col.width+'px','height':titleRowHeight+'px','text-align':col.titleAlign}">
                                        <span class="table-title">
                                            <span v-if="col.type === 'selection'">
                                                 <v-checkbox
                                                         @change="handleCheckAll"
                                                         :indeterminate="indeterminate"
                                                         v-model="isAllChecked"
                                                         :show-slot="false"
                                                         label="check-all"
                                                 ></v-checkbox>
                                            </span>
                                            <span v-else v-html="col.title"></span>
                                            <span @click.stop="sortControl(col.field)"
                                                  class="v-table-sort-icon"
                                                  v-if="enableSort(col.orderBy)">
                                                        <i :class='["v-icon-up-dir",getCurrentSort(col.field) ==="asc" ? "checked":""]'></i>
                                                        <i :class='["v-icon-down-dir",getCurrentSort(col.field) ==="desc" ? "checked":""]'></i>
                                            </span>
                                            <!--filters-->
                                            <v-dropdown class="v-table-dropdown" v-if="enableFilters(col.filters)"
                                                        v-model="col.filters"
                                                        :show-operation="col.filterMultiple"
                                                        :is-multiple="col.filterMultiple"
                                                        @on-filter-method="filterEvent"
                                                        @change="filterConditionChange(col.filterMultiple)"
                                            >
                                                 <i :class="['v-table-filter-icon',vTableFiltersIcon(col.filters)]"></i>
                                            </v-dropdown>
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        </template>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 加载进度条 -->
            <slot name="progress" v-if="isLoading"></slot>

            <!--右列内容-->
            <div :class="['v-table-body v-table-body-class',vTableRightBody]"
                 :style="{'width': rightViewWidth+'px', 'height': bodyViewHeight+'px'}">
                <v-checkbox-group v-model="checkboxGroupModel" @change="handleCheckGroupChange">
                    <table class="v-table-btable" cellspacing="0" cellpadding="0" border="0">
                        <tbody>
                        <tr :key="rowIndex" v-for="(item,rowIndex) in tableData_" class="v-table-row"
                            :style="[trBgColor(rowIndex+1)]"
                            @mouseenter.stop="handleMouseEnter(rowIndex)"
                            @mouseleave.stop="handleMouseOut(rowIndex)"
                        >
                            <td v-if="cellMergeInit(rowIndex,col.field,item,false)"
                                v-for="(col,colIndex) in noFrozenCols"
                                :key="colIndex"
                                :colSpan="setColRowSpan(rowIndex,col.field,item).colSpan"
                                :rowSpan="setColRowSpan(rowIndex,col.field,item).rowSpan"
                                :class="[setColumnCellClassName(rowIndex,col.field,item)]">
                                <!--存在列合并-->
                                <div v-if="isCellMergeRender(rowIndex,col.field,item)"
                                     :class="['v-table-body-cell',showVerticalBorder ? 'vertical-border':'',showHorizontalBorder?'horizontal-border':'']"
                                     :style="{'width':getRowWidthByColSpan(rowIndex,col.field,item)+'px','height': getRowHeightByRowSpan(rowIndex,col.field,item)+'px','line-height':getRowHeightByRowSpan(rowIndex,col.field,item)+'px','text-align':col.columnAlign}"
                                     :title="col.overflowTitle ?  overflowTitle(item,rowIndex,col) :''"
                                     @click.stop="rowCellClick(rowIndex,item,col, $event);cellEditClick($event,col.isEdit,item,col.field,rowIndex)"
                                     @dblclick.stop="rowCellDbClick(rowIndex,item,col)"
                                >
                                <span v-if="cellMergeContentType(rowIndex,col.field,item).isComponent">
                                    <component :rowData="item" :field="col.field ? col.field : ''" :index="rowIndex"
                                               :is="cellMerge(rowIndex,item,col.field).componentName"
                                               @on-custom-comp="customCompFunc"></component>
                                </span>
                                    <span v-else v-html="cellMerge(rowIndex,item,col.field).content">
                                </span>
                                </div>
                                <!--不存在列合并-->
                                <div v-else
                                     :class="['v-table-body-cell',showVerticalBorder ? 'vertical-border':'',showHorizontalBorder?'horizontal-border':'']"
                                     :style="{'width':col.width+'px','height': rowHeight+'px','line-height':rowHeight+'px','text-align':col.columnAlign}"
                                     :title="col.overflowTitle ?  overflowTitle(item,rowIndex,col) :''"
                                     @click.stop="rowCellClick(rowIndex,item,col, $event);cellEditClick($event,col.isEdit,item,col.field,rowIndex)"
                                     @dblclick.stop="rowCellDbClick(rowIndex,item,col)"
                                >
                                <span v-if="typeof col.componentName ==='string' && col.componentName.length > 0">
                                    <component :rowData="item" :field="col.field ? col.field : ''" :index="rowIndex"
                                               :is="col.componentName" @on-custom-comp="customCompFunc"></component>
                                </span>
                                    <span v-else-if="typeof col.formatter==='function'"
                                          v-html="col.formatter(item,rowIndex,pagingIndex,col.field)">
                                </span>
                                    <span v-else-if="col.type === 'selection'">
                                        <v-checkbox @change="handleCheckChange(item)" :show-slot="false"
                                                    :disabled="item._disabled" :label="rowIndex"></v-checkbox>
                                </span>
                                    <span v-else>
                                     {{item[col.field]}}
                                </span>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </v-checkbox-group>
            </div>

            <!--footer-->
            <div v-if="noFrozenFooterCols.length > 0"
                 :class="['v-table-footer','v-table-footer-class',vTableFooter]"
                 :style="{'width': rightViewWidth+'px','height':footerTotalHeight}">
                <table class="v-table-ftable" cellspacing="0" cellpadding="0" border="0">
                    <tr class="v-table-row" v-for="(item,rowIndex) in noFrozenFooterCols" :key="rowIndex">
                        <td v-for="(col,colIndex) in item"
                            :key="colIndex"
                            :class="setFooterCellClassName(false,rowIndex,colIndex,col.content)">
                            <div :style="{'height':footerRowHeight+'px','line-height':footerRowHeight+'px','width':col.width+'px','text-align':col.align}"
                                 :class="['v-table-body-cell',vTableBodyCell]"
                                 v-html="col.content"></div>
                        </td>
                    </tr>
                </table>
            </div>
        </div>

        <table-empty
          v-if="isTableEmpty && isError"
          :width="width_"
          :total-columns-width="totalColumnsWidth"
          :content-height="errorContentHeight"
          :title-height="getTotalColumnsHeight()"
          :error-content="errorContent"
          :is-loading="isLoading"
        ></table-empty>
        <table-empty
          v-if="isTableEmpty && !isError"
          :width="width_"
          :total-columns-width="totalColumnsWidth"
          :title-height="getTotalColumnsHeight()"
          :error-content="noDataContent"
          :is-loading="isLoading"
        ></table-empty>

        <!-- <loading
          v-if="isLoading"
          :loading-content="loadingContent"
          :title-rows="titleRows_"
          :title-row-height="titleRowHeight"
          :columns="columns_"
          :loading-opacity="loadingOpacity"
        ></loading> -->

        <!--列拖动时的线条-->
        <div v-show="isDragging" class="v-table-drag-line"></div>
    </div>
  </div>
</template>

<script>
    import _ from 'lodash';
    import classesMixin from './classes-mixin.js';
    import scrollControlMixin from './scroll-control-mixin.js';
    import frozenColumnsMixin from './frozen-columns-mixin.js';
    import tableResizeMixin from './table-resize-mixin.js';
    import sortControlMixin from './sort-control-mixin.js';
    import tableEmptyMixin from './table-empty-mixin.js';
    import dragWidthMixin from './drag-width-mixin.js';
    import cellEditMixin from './cell-edit-mixin.js';
    import bodyCellMergeMixin from './body-cell-merge-mixin.js';
    import titleCellMergeMixin from './title-cell-merge-mixin.js';
    import checkboxSelectionMixin from './checkbox-selection-mixin.js';
    import tableFooterMixin from './table-footer-mixin.js';
    import scrollBarControlMixin from './scroll-bar-control-mixin.js';
    import tableRowMouseEventsMixin from './table-row-mouse-events-mixin';
    import tableFiltersMixin from './table-filters-mixin';

    import utils from '../../src/utils/utils.js';
    // import deepClone from '../../src/utils/deepClone.js';

    import tableEmpty from './table-empty.vue';
    import loading from './loading.vue';
    import VCheckboxGroup from '../../v-checkbox-group/index.js';
    import VCheckbox from '../../v-checkbox/index.js';
    import VDropdown from '../../v-dropdown/index.js';


    export default {
      name: 'v-table',
      mixins: [classesMixin, tableResizeMixin, frozenColumnsMixin, scrollControlMixin, sortControlMixin, tableEmptyMixin, dragWidthMixin, cellEditMixin, bodyCellMergeMixin, titleCellMergeMixin, checkboxSelectionMixin, tableFooterMixin, scrollBarControlMixin, tableRowMouseEventsMixin, tableFiltersMixin],
      components: { tableEmpty, loading, VCheckboxGroup, VCheckbox, VDropdown },
      data () {
        return {
                // 本地列表数据
          tableData_: [],
                // 本地宽度
          width_: 0,
                // 本地高度
          height_: 0,
                // 本地列数据
          columns_: [],
                // 本地复杂表头数据
          titleRows_: [],
          errorMsg: ' V-Table error: ',
                // 最大宽度（当width:'max'时）
          maxWidth: 5000,
          hasFrozenColumn: false, // 是否拥有固定列（false时最后一列的右边border无边框）
          resizeTimer: null,
        };
      },
      props: {
        width: [Number, String],
        minWidth: {
          type: Number,
          default: 50,
        },
        height: {
          type: Number,
          require: false,
        },
        minHeight: {
          type: Number,
          default: 50,
        },
        titleRowHeight: {
          type: Number,
          default: 38,
        },
        /**
         *  随着浏览器窗口改变，横向自适应
         * 如果是横向自适应需要满足下面条件：
         * 1.通过 is-horizontal-resize 属性设置横向自适应；
         * 2.通过 isResize 属性设置哪些列需要自适应（所有列都可以设置，达到所有列自适应）；
         * 3.通过 style="width:100%" 设置显示比例（百分比的值根据需求而定）；
         * 4.每个列必须提供宽度，这个宽度是自适应的最小宽度；
        */
        isHorizontalResize: {
          type: Boolean,
          default: false,
        },
            // 随着浏览器窗口改变，垂直自适应
        isVerticalResize: {
          type: Boolean,
          default: false,
        },

            // 垂直自适应偏移量
        verticalResizeOffset: {
          type: Number,
          default: 0,
        },

        tableBgColor: {
          type: String,
          default: '#fff',
        },

            // 表头背景颜色
        titleBgColor: {
          type: String,
          default: '#fff',
        },

            // 奇数行颜色
        oddBgColor: {
          type: String,
          default: '',
        },
            // 偶数行颜色
        evenBgColor: {
          type: String,
          default: '',
        },
            // 内容行高
        rowHeight: {
          type: Number,
          default: 40,
        },
            // 多列排序
        multipleSort: {
          type: Boolean,
          default: true,
        },
            // 只在 升序和倒序切换
        sortAlways: {
          type: Boolean,
          default: false,
        },
        columns: {
          type: Array,
          require: true,
          validator (val) {
            return Array.isArray(val);
          },
          default: () => [],
        },

            // 特殊表头
        titleRows: {
          type: Array,
          require: true,
          default () {
            return [];
          },
        },
        tableData: {
          type: Array,
          require: true,
          validator (val) {
            return Array.isArray(val);
          },
          default: () => [],
        },
            // 分页序号
        pagingIndex: Number,
            // 没数据时的html
        isError: {
          type: Boolean,
          default: false,
        },
        errorContent: {
          type: String,
          default: '暂无数据',
        },
        noDataContent: {
          type: String,
          default: 'There is no data to display',
        },
        // 没数据时内容区域高度
        errorContentHeight: {
          type: Number,
          default: 50,
        },
            // 是否正在加载,为false 则会显示错误信息（如果加载时间较长，最好设置为true,数据返回后设置为false）
        isLoading: {
          type: Boolean,
          default: false,
        },
        loadingContent: {
          type: String,
          default: '<span><i class="v-icon-spin5 animate-loading-23" style="font-size: 28px;opacity:0.6;"></i></span>',
        },
            // 不设置则没有hover效果
        rowHoverColor: {
          type: String,
        },
        rowClickColor: {
          type: String,
        },
        showVerticalBorder: {
          type: Boolean,
          default: true,
        },
        showHorizontalBorder: {
          type: Boolean,
          default: true,
        },
        footer: {
          type: Array,
          default () {
            return [];
          },
        },
        footerRowHeight: {
          type: Number,
          default: 40,
        },
        columnWidthDrag: {
          type: Boolean,
          default: false,
        },
        loadingOpacity: {
          type: Number,
          default: 0.6,
        },
            // 表体单元格样式回调
        columnCellClassName: Function,
            // footer单元格样式回调
        footerCellClassName: Function,
            // 行单击回调
        rowClick: Function,
            // 行双击回调
        rowDblclick: Function,
            // 表头单元格单击回调
        titleClick: Function,
            // 表头单元格双击回调
        titleDblclick: Function,
            // 鼠标进入行的回调
        rowMouseEnter: Function,
            // 鼠标离开行的回调
        rowMouseLeave: Function,
            // 单元格编辑完成回调
        cellEditDone: Function,
            // 单元格合并
        cellMerge: Function,
            // select all
        selectAll: Function,
            // 单个checkbox change event
        selectChange: Function,
            // checkbox-group change event
        selectGroupChange: Function,
            // filter event
        filterMethod: Function,
      },
      computed: {

            // 是否是复杂表头
        isComplexTitle () {
          return (Array.isArray(this.titleRows_) && this.titleRows_.length > 0);
        },

            // 获取表格高度
        getTableHeight () {
          return this.isTableEmpty ? this.tableEmptyHeight : this.height_;
        },

            // 左侧区域宽度
        leftViewWidth () {
          let result = 0;
          if (this.hasFrozenColumn) {
            result = this.frozenCols.reduce((total, curr) => total + curr.width, 0);
          }
          return result;
        },
            // 右侧区域宽度
        rightViewWidth () {
          const result = this.width_ - this.leftViewWidth;

          return this.hasFrozenColumn ? result - 2 : result;
        },

            // 左侧、右侧区域高度
        bodyViewHeight () {
          let result;
          if (this.titleRows_.length > 0) {
            result = this.height_ - this.titleRowHeight * (this.titleRows_.length + this.getTitleRowspanTotalCount);
          } else {
            result = this.height_ - this.titleRowHeight;
          }

                // 1px: 当有滚动条时，使滚动条显示全
          result -= (this.footerTotalHeight + 1);

          return result;
        },

            // 所有列的总宽度
            // TODO 每个列都必须指定 width 吗？
        totalColumnsWidth () {
          return this.columns_.reduce(function (total, curr) {
            return curr.width ? (total + curr.width) : total;
          }, 0);
        },

            // 获取未固定列的总宽度
        totalNoFrozenColumnsWidth () {
          return this.noFrozenCols.reduce(function (total, curr) {
            return curr.width ? (total + curr.width) : total;
          }, 0);
        },

            // 获取所有的字段
        getColumnsFields () {
          return this.columns_.map(item => item.field);
        },

            // 获取非固定列的字段集合
        getNoFrozenColumnsFields () {
          return this.columns_.filter(x => !x.isFrozen).map(item => item.field);
        },

            // 获取固定列的字段集合
        getFrozenColumnsFields () {
          return this.columns_.filter(x => x.isFrozen).map(item => item.field);
        },
      },
      methods: {
            // custom columns component event
        customCompFunc (params) {
          this.$emit('on-custom-comp', params);
        },

            // 行颜色
        trBgColor (num) {
          if ((this.evenBgColor && this.evenBgColor.length > 0) || (this.oddBgColor && this.oddBgColor.length > 0)) {
            return num % 2 === 0 ? { 'background-color': this.evenBgColor } : { 'background-color': this.oddBgColor };
          }
        },

            // 设置 column 列的样式
        setColumnCellClassName (rowIndex, field, rowData) {
          return this.columnCellClassName && this.columnCellClassName(rowIndex, field, rowData);
        },

            // 获取每个表头列的宽度
        titleColumnWidth (fields) {
          let result = 0;
          if (Array.isArray(fields)) {
            const matchItems = this.columns_.filter((item, index) => fields.some(x => x === item.field));

            result = matchItems.reduce((total, curr) => total + curr.width, 0);
          } else {
            console.error(`${this.errorMsg}the fields attribute must be a array in titleRows`);
          }
          return result;
        },

            // 获取每个表头列的高度
        titleColumnHeight (rowspan) {
          if (rowspan && rowspan > 0) {
            return this.titleRowHeight * rowspan;
          }
          return this.titleRowHeight;
        },

            // 超出的title提示
        overflowTitle (row, rowIndex, col) {
          let result = '';
          if (typeof col.formatter === 'function') {
            const val = col.formatter(row, rowIndex, this.pagingIndex, col.field);
                    // 如果是html 不处理
            if (utils.isHtml(val)) {
              result = '';
            } else {
              result = val;
            }
          } else {
            result = row[col.field];
          }
          return result;
        },

            // 获取所有列的总高度
        getTotalColumnsHeight () {
          let titleTotalHeight = (this.titleRows_ && this.titleRows_.length > 0) ? this.titleRowHeight * this.titleRows_.length : this.titleRowHeight;

          titleTotalHeight += this.footerTotalHeight;

          return titleTotalHeight + this.tableData_.length * this.rowHeight + 1;
        },


            // 初始化width
        initTableWidth () {
          this.width_ = this.isHorizontalResize ? this.maxWidth : this.width;
        },

            // 当宽度设置 && 非固定列未设置宽度时（列自适应）初始化列集合
        initColumns () {
          this.height_ = this.height;

          this.footerTotalHeight = this.getFooterTotalRowHeight;

          this.columns_ = _.cloneDeep(this.columns);
          this.titleRows_ = _.cloneDeep(this.titleRows);

          this.initColumnsFilters();

          /**
           * 这部分几乎都是在处理宽度相关的内容
           * 1. 通过计算属性 totalColumnsWidth 得到传入的所有列的总宽度
           * 2. this.resizeColumns = this.columns_.filter(item => item.isResize);
           */
          this.initResizeColumns();

          this.hasFrozenColumn = this.columns_.some(x => x.isFrozen);

          this.initTableWidth(); // this.width_ = this.isHorizontalResize ? this.maxWidth : this.width;

          this.setSortColumns();


          let self = this, widthCountCheck = 0;

          if (self.width_ && self.width_ > 0) {
            const isHorizontalResize = this.isHorizontalResize;
            self.columns_.forEach(function (item) {
              // if (!(item.width && item.width > 0)) {
              if (!item.width) {
                widthCountCheck++;
                if (isHorizontalResize) {
                  console.error(`${self.errorMsg}If you are using the isHorizontalResize property,Please set the value for each column's width`);
                } else {
                  item.width = self.width_ - self.totalColumnsWidth;
                }
              }
            });
          }

          if (widthCountCheck > 1) {
            console.error(`${this.errorMsg}Only allow one column is not set width`);
          }
        },


            // 当没设置宽度和高度时动态计算
        initView () {
                // 当没有设置宽度计算总宽度
          if (!(this.width_ && this.width_ > 0)) {
            if (this.columns && this.columns.length > 0) {
              this.width_ = this.columns.reduce((total, curr) => total + curr.width, 0);
              // TODO 这种做法是否可以？ this.width_ = this.totalColumnsWidth;
            }
          }

          const totalColumnsHeight = this.getTotalColumnsHeight();

                // 当没有设置高度时计算总高度 || 设置的高度大于所有列高度之和时
          if (!(this.height && this.height > 0) || this.height > totalColumnsHeight) {
            if (!this.isVerticalResize) {
              this.height_ = totalColumnsHeight;
            }
          } else if (this.height <= totalColumnsHeight) {
            this.height_ = this.height;
          }
        },

        cloneTableData () {
          // return Array.isArray(this.tableData) ? deepClone(this.tableData) : [];
          // return Array.isArray(this.tableData) ? _.cloneDeep(this.tableData) : [];
          return _.cloneDeep(this.tableData);
        },

        // 对外暴露（隐藏显示切换时）
        // TODO 为何需要使用 setTimeout 来做？
        resize () {
                // fixed bug in IE9 #17
          this.resizeTimer = setTimeout(x => {
            this.tableResize();
          });
        },
      },
      created () {
        this.tableData_ = this.cloneTableData(this.tableData);

        if (Array.isArray(this.columns) && this.columns.length > 0) {
          this.initColumns();
        }

        /**
         * 1. this.hasSelectionColumns => this.columns_.some(col.type === 'selection')
         * 2. 设置选中行的状态：this.checkboxGroupModel.push(itemIndex if item._checked)
         * 3. 设置全选按钮的状态
         */
        this.updateCheckboxGroupModel();

        this.initView();
      },
      mounted () {
        // 获得表格的滚动条
        // v-scrollbar-wrap	表格滚动条样式名称（如果需要对表格滚动条样式进行订制，需要通过这个样式设置）
        this.setScrollbarWidth();

        this.tableEmpty();

        this.tableResize();

        if (Array.isArray(this.tableData) && this.tableData.length > 0) {
          this.scrollControl();
        }

        this.controlScrollBar();
      },
      watch: {
        // 重新覆盖复杂表头信息
        titleRows (newVal) {
          this.initColumns();
          this.tableResize();
        },
            // 重新跟新列信息
        columns (newVal) {
          this.initColumns();
          this.tableResize();
        },
            // deep watch
        tableData (newVal) {
          this.skipRenderCells = [];

          this.tableData_ = this.cloneTableData(newVal);


          this.updateCheckboxGroupModel();

          this.tableEmpty();

          if (Array.isArray(newVal) && newVal.length > 0) {
            this.initView();

            this.scrollControl();
          }

          this.resize();
        },
        'pagingIndex': {

          handler () {
            this.clearCurrentRow();

            this.bodyScrollTop();
          },
        },
      },
      beforeDestroy () {
        clearTimeout(this.resizeTimer);
      },
    };
</script>

<style lang="scss" scoped>

.theme--light {
  table {
    background-color: #fff;
    color: rgba(0,0,0,0.87);

    border-radius: 2px;
    border-collapse: collapse;
    border-spacing: 0;
    // width: 100%;
    max-width: 100%;
  }

  // tbody tr:not(:last-child) {
  //   border-bottom: 1px solid rgba(0,0,0,0.12);
  // }

  tbody tr {
    transition: background 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
    will-change: background;
  }

  table tbody td {
    font-weight: 400;
    font-size: 13px;
  }

  // // 支持自定义高度
  // table tbody td,
  // table tbody th {
  //   height: 42px;
  // }


  // 支持通过 CSS 自定义 奇偶行的样式
  // 支持通过 CSS 自定义 垂直分割线的样式
  tbody tr:nth-child(even) td {
    // background: #eef0f2;
    background: #f9f9fa;
  }

  // easy table config
  horizontal-border {
    border-bottom-width: 1px !important;
  }

  .v-table-title-cell {
    /* margin: 0; */
    border-width: 0;
    border-style: solid;
    border-color: rgba(221, 221, 221, 1);
  }

  .table-title {
    display: inline-block;
    // padding: 0 3px;
    vertical-align: middle;
    word-break: break-all;
    overflow: hidden;
    line-height: 1.2em;
  }


}
</style>
