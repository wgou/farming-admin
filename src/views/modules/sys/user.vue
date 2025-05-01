<template>
  <div class="app-container">
    <appLayout :showtop="showSearch">
      <template #top>
        <cardSearch>
          <div slot="left">
            <el-form :inline="true" :model="dataForm" size="small" @keyup.enter.native="getDataList()">
              <el-form-item label="用户名">
                <el-input v-model="dataForm.userName" placeholder="用户名" clearable></el-input>
              </el-form-item>
            </el-form>
          </div>
          <div slot="right">
            <el-button type="primary" icon="el-icon-search" size="mini" @click="getDataList()">查询</el-button>
            <el-button type="primary" icon="el-icon-search" size="mini" v-if="isAuth('sys:user:save')"
              @click="addOrUpdateHandle()">新增</el-button>
            <el-button v-if="isAuth('sys:user:delete')" type="info" plain size="mini" @click="deleteHandle()"
              :disabled="dataListSelections.length <= 0">批量删除</el-button>
          </div>
        </cardSearch>
      </template>
      <template #dmain="scope">
        <div>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getDataList"></right-toolbar>
        </div>
        <el-table :data="dataList" border v-loading="dataListLoading" :height="scope.maxheight"
          @selection-change="selectionChangeHandle" style="width: 100%;">
          <el-table-column type="selection" header-align="center" align="center" width="50">
          </el-table-column>
          <el-table-column prop="userId" header-align="center" align="center" width="80" label="ID">
          </el-table-column>
          <el-table-column prop="username" header-align="center" align="center" label="用户名">
          </el-table-column>
          <el-table-column prop="createUserName" header-align="center" align="center" label="创建者">
          </el-table-column>
          <el-table-column prop="status" header-align="center" align="center" label="状态">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.status === 0" size="small" type="danger">禁用</el-tag>
              <el-tag v-else size="small">正常</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" header-align="center" align="center" width="180" label="创建时间">
          </el-table-column>
          <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
            <template slot-scope="scope">
              <el-button v-if="isAuth('sys:user:update')" type="text" size="small"
                @click="addOrUpdateHandle(scope.row.userId)">修改</el-button>
              <el-button v-if="isAuth('sys:user:delete')" type="text" size="small"
                @click="deleteHandle(scope.row.userId)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <div class="page">
          <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" :current-page="pageIndex"
            :page-sizes="[20, 30, 40, 50, 100]" :page-size="size" :total="totalPage"
            layout="total, sizes, prev, pager, next, jumper">
          </el-pagination>
        </div>
        <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
      </template>
    </appLayout>
  </div>
</template>

<script>
import AddOrUpdate from './user-add-or-update'
export default {
  data() {
    return {
      // 显示搜索
      showSearch: !this.isMobile,
      dataForm: {
        userName: ''
      },
      dataList: [],
      pageIndex: 1,
      size: 20,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false
    }
  },
  components: {
    AddOrUpdate
  },
  activated() {
    this.getDataList()
  },
  created() {
    this.getDataList()
  },
  methods: {
    // 获取数据列表
    getDataList() {
      this.dataListLoading = true
      this.$http({
        url: this.$http.adornUrl('/sys/user/list'),
        method: 'get',
        params: this.$http.adornParams({
          'page': this.pageIndex,
          'limit': this.size,
          'username': this.dataForm.userName
        })
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.dataList = data.page.list
          this.totalPage = data.page.totalCount
        } else {
          this.dataList = []
          this.totalPage = 0
        }
        this.dataListLoading = false
      })
    },
    // 每页数
    sizeChangeHandle(val) {
      this.size = val
      this.pageIndex = 1
      this.getDataList()
    },
    // 当前页
    currentChangeHandle(val) {
      this.pageIndex = val
      this.getDataList()
    },
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val
    },
    // 新增 / 修改
    addOrUpdateHandle(id) {
      this.addOrUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(id)
      })
    },
    // 删除
    deleteHandle(id) {
      var userIds = id ? [id] : this.dataListSelections.map(item => {
        return item.userId
      })
      this.$confirm(`确定对[id=${userIds.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: this.$http.adornUrl('/sys/user/delete'),
          method: 'post',
          data: this.$http.adornData(userIds, false)
        }).then(({ data }) => {
          if (data && data.code === 0) {
            this.$message({
              message: '操作成功',
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.getDataList()
              }
            })
          } else {
            this.$message.error(data.msg)
          }
        })
      }).catch(() => { })
    }
  }
}
</script>
