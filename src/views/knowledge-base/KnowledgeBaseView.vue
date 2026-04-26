<template>
  <AppShell>
    <div class="page-grid">
      <PageHero
        kicker="Knowledge Base"
        title="规范知识库管理"
        description="在浏览器端完成规范导入、文件预检、删除和预览，让任务书与场地分析都能挂接到可回看的依据。"
      >
        <template #actions>
          <el-button
            type="primary"
            :loading="store.loading.bundledIngest"
            @click="handleImportBundled"
          >
            导入内置规范
          </el-button>
          <el-button @click="router.push('/site-analysis')">
            先做场地分析
          </el-button>
        </template>
        <template #aside>
          <div class="hero-summary">
            <div class="hero-summary__item">
              <span class="section-caption">文档数</span>
              <strong>{{ store.knowledgeBase.documentCount }}</strong>
            </div>
            <div class="hero-summary__item">
              <span class="section-caption">状态</span>
              <strong>{{ store.knowledgeBase.ready ? 'Ready' : 'Waiting' }}</strong>
            </div>
          </div>
        </template>
      </PageHero>

      <section class="metric-grid">
        <MetricCard
          label="知识库状态"
          :value="store.knowledgeBase.ready ? '已就绪' : '待导入'"
        />
        <MetricCard
          label="规范文件数"
          :value="String(store.knowledgeBase.documentCount)"
        />
        <MetricCard
          label="案例库规模"
          :value="String(store.referenceLibrary.length)"
        />
        <MetricCard
          label="检索条数"
          :value="String(store.settings.retrievalTopK)"
        />
      </section>

      <section class="kb-grid">
        <section class="surface-card panel-stack upload-panel">
          <div>
            <h3 class="section-title">上传与预检</h3>
            <p class="muted">支持 `.txt / .pdf / .docx`，如上传 `.doc` 建议先转换后再导入。</p>
          </div>

          <el-upload
            :auto-upload="false"
            :show-file-list="false"
            accept=".txt,.pdf,.docx,.doc"
            @change="handleSelectFile"
          >
            <el-button type="primary" plain>
              选择规范文件
            </el-button>
          </el-upload>

          <div class="file-state">
            <span class="muted">当前文件</span>
            <strong>{{ selectedFile?.name || '尚未选择文件' }}</strong>
          </div>

          <div class="action-row">
            <el-button :disabled="!selectedFile" @click="handlePrecheck">
              预检文件
            </el-button>
            <el-button
              type="primary"
              :disabled="!selectedFile"
              :loading="store.loading.fileIngest"
              @click="handleIngestFile"
            >
              导入知识库
            </el-button>
          </div>

          <div v-if="store.kbPrecheckResult" class="precheck-card">
            <strong>预检结果</strong>
            <p>文件：{{ store.kbPrecheckResult.filename }}</p>
            <p>解析单元：{{ store.kbPrecheckResult.documentCount }}</p>
            <p>预计片段：{{ store.kbPrecheckResult.chunkCount }}</p>
            <el-input
              type="textarea"
              :model-value="store.kbPrecheckResult.preview"
              :rows="5"
              readonly
            />
          </div>
        </section>

        <section class="surface-card panel-stack panel">
          <div class="panel-head">
            <div>
              <h3 class="section-title">规范目录</h3>
              <p class="muted">支持删除内置文件和上传文件，删除后会立即从当前知识库检索范围中移除。</p>
            </div>
            <el-select
              v-model="previewFileId"
              placeholder="选择预览文件"
              class="preview-select"
            >
              <el-option
                v-for="item in store.knowledgeBase.documents"
                :key="item.id"
                :label="item.filename"
                :value="item.id"
              />
            </el-select>
          </div>

          <el-table
            :data="store.knowledgeBase.documents"
            empty-text="当前还没有入库文件。"
          >
            <el-table-column prop="filename" label="文件名" min-width="220" />
            <el-table-column label="来源" width="120">
              <template #default="{ row }">
                <el-tag effect="plain" :type="row.sourceType === 'bundled' ? 'success' : 'info'">
                  {{ row.sourceType === 'bundled' ? '内置规范' : '外部上传' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="chunkCount" label="片段" width="90" />
            <el-table-column label="最近入库" width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.ingestedAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="right">
              <template #default="{ row }">
                <el-button link type="danger" @click="handleDeleteRecord(row.id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div v-if="selectedPreviewRecord" class="preview-card">
            <div class="preview-card__head">
              <div>
                <strong>{{ selectedPreviewRecord.filename }}</strong>
                <p class="muted">
                  {{ selectedPreviewRecord.sourceType === 'bundled' ? '内置资源' : '上传文件' }}
                  · {{ selectedPreviewRecord.chunkCount }} 个片段
                </p>
              </div>
              <el-button
                link
                type="danger"
                @click="handleDeleteRecord(selectedPreviewRecord.id)"
              >
                删除当前文件
              </el-button>
            </div>
            <el-input
              type="textarea"
              :model-value="selectedPreviewRecord.content.slice(0, 1600)"
              :rows="12"
              readonly
            />
          </div>
        </section>
      </section>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { UploadFile, UploadFiles } from 'element-plus';
import { ElMessage, ElMessageBox } from 'element-plus';

import AppShell from '@/components/layout/AppShell.vue';
import MetricCard from '@/components/panels/MetricCard.vue';
import PageHero from '@/components/panels/PageHero.vue';
import { useWorkflowStore } from '@/stores/workflow';
import { formatDateTime } from '@/utils/format';

const router = useRouter();
const store = useWorkflowStore();

const selectedFile = ref<File | null>(null);
const previewFileId = ref('');

const selectedPreviewRecord = computed(() =>
  store.knowledgeBase.documents.find((item) => item.id === previewFileId.value) ||
  store.knowledgeBase.documents[0] ||
  null
);

watch(
  () => store.knowledgeBase.documents.map((item) => item.id),
  (ids) => {
    if (!ids.length) {
      previewFileId.value = '';
      return;
    }
    if (!ids.includes(previewFileId.value)) {
      previewFileId.value = ids[0];
    }
  },
  { immediate: true }
);

function handleSelectFile(uploadFile: UploadFile, _files: UploadFiles) {
  selectedFile.value = uploadFile.raw || null;
}

async function handlePrecheck() {
  if (!selectedFile.value) return;
  try {
    await store.runPrecheck(selectedFile.value);
    ElMessage.success('文件预检完成。');
  } catch (error) {
    ElMessage.error((error as Error).message);
  }
}

async function handleImportBundled() {
  try {
    const results = await store.importBundledKnowledgeBase();
    const added = results.filter((item) => !item.skipped).length;
    const skipped = results.filter((item) => item.skipped).length;
    ElMessage.success(`导入完成：新增 ${added} 个文件，跳过 ${skipped} 个重复文件。`);
  } catch (error) {
    ElMessage.error((error as Error).message);
  }
}

async function handleIngestFile() {
  if (!selectedFile.value) return;
  try {
    const result = await store.importUploadedKnowledgeFile(selectedFile.value);
    if (result.skipped) {
      ElMessage.info(`文件已存在，已跳过重复入库：${result.filename}`);
    } else {
      ElMessage.success(`知识库更新成功：${result.filename}，新增 ${result.chunkCount} 个片段。`);
    }
  } catch (error) {
    ElMessage.error((error as Error).message);
  }
}

async function handleDeleteRecord(documentId: string) {
  const target = store.knowledgeBase.documents.find((item) => item.id === documentId);
  if (!target) return;

  try {
    await ElMessageBox.confirm(
      `确认删除“${target.filename}”吗？删除后它将不再参与当前知识库检索。`,
      '删除知识库文件',
      {
        type: 'warning',
        confirmButtonText: '确认删除',
        cancelButtonText: '取消'
      }
    );

    store.removeKnowledgeDocument(documentId);
    ElMessage.success(`已删除 ${target.filename}`);
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error((error as Error).message);
    }
  }
}
</script>

<style scoped lang="scss">
.kb-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 360px), 1fr));
  gap: 1rem;
}

.panel,
.upload-panel {
  padding: 1.05rem 1.1rem;
  min-width: 0;
  background:
    radial-gradient(circle at top right, rgba(216, 203, 171, 0.16), transparent 26%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.52), rgba(241, 240, 232, 0.42)),
    rgba(255, 252, 246, 0.42);
}

.file-state {
  display: grid;
  gap: 0.35rem;
  padding: 0.9rem 0.95rem;
  border-radius: var(--radius-md);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.62), rgba(234, 237, 227, 0.45)),
    rgba(255, 252, 246, 0.42);
  border: 1px solid rgba(113, 132, 109, 0.08);
  box-shadow: var(--shadow-soft);
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.precheck-card,
.preview-card {
  display: grid;
  gap: 0.55rem;
  padding: 0.95rem 1rem;
  border-radius: var(--radius-md);
  min-width: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.62), rgba(240, 239, 231, 0.46)),
    rgba(255, 252, 246, 0.4);
  border: 1px solid rgba(113, 132, 109, 0.08);
  box-shadow: var(--shadow-soft);
}

.precheck-card p,
.preview-card p {
  margin: 0;
}

.panel-head,
.preview-card__head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.preview-select {
  width: min(100%, 280px);
}

.hero-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.hero-summary__item {
  display: grid;
  gap: 0.35rem;
  padding: 0.85rem 0.95rem;
  border-radius: var(--radius-md);
  border: 1px solid rgba(113, 132, 109, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.65), rgba(239, 238, 230, 0.44)),
    rgba(255, 252, 246, 0.4);
  box-shadow: var(--shadow-soft);
}

.hero-summary__item strong {
  font-size: 1.6rem;
  line-height: 1.1;
  font-family: var(--font-display);
  word-break: break-word;
}

@media (max-width: 1080px) {
  .kb-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .panel-head,
  .preview-card__head {
    flex-direction: column;
  }

  .hero-summary {
    grid-template-columns: 1fr;
  }
}
</style>
