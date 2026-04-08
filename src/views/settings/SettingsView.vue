<template>
  <AppShell>
    <div class="page-grid">
      <PageHero
        kicker="Settings"
        title="项目参数、提示词后台与调试入口"
        description="把模型参数、运行模式和提示词模板统一放到后台配置区，便于你按不同项目快速调整输出风格。"
      />

      <section class="settings-grid">
        <section class="surface-card form-panel panel-stack">
          <div>
            <h3 class="section-title">工作区设置</h3>
            <p class="muted">这里维护项目基础参数和模型连接配置。</p>
          </div>

          <el-form label-position="top">
            <el-form-item label="项目名称">
              <el-input
                :model-value="store.settings.projectName"
                @input="store.updateSettings({ projectName: String($event) })"
              />
            </el-form-item>
            <el-form-item label="运行模式">
              <el-segmented
                :model-value="store.settings.runMode"
                :options="runModeOptions"
                @change="handleRunModeChange"
              />
            </el-form-item>
            <el-form-item label="API Key">
              <el-input
                :model-value="store.settings.apiKey"
                type="password"
                show-password
                placeholder="演示模式下可留空"
                @input="store.updateSettings({ apiKey: String($event) })"
              />
            </el-form-item>
            <el-form-item label="Base URL">
              <el-input
                :model-value="store.settings.baseUrl"
                @input="store.updateSettings({ baseUrl: String($event) })"
              />
            </el-form-item>
            <div class="grid-two">
              <el-form-item label="主模型">
                <el-input
                  :model-value="store.settings.modelName"
                  @input="store.updateSettings({ modelName: String($event) })"
                />
              </el-form-item>
              <el-form-item label="嵌入模型">
                <el-input
                  :model-value="store.settings.embeddingModel"
                  @input="store.updateSettings({ embeddingModel: String($event) })"
                />
              </el-form-item>
            </div>
            <el-form-item label="规范检索条数">
              <el-slider
                :model-value="store.settings.retrievalTopK"
                :min="1"
                :max="8"
                show-input
                @input="store.updateSettings({ retrievalTopK: Number($event) })"
              />
            </el-form-item>
          </el-form>

          <div class="action-row">
            <el-button type="danger" plain @click="handleReset">
              重置工作区
            </el-button>
          </div>
        </section>

        <div class="panel-stack">
          <section class="surface-card info-panel panel-stack">
            <div>
              <h3 class="section-title">提示词后台</h3>
              <p class="muted">修改后会直接影响远程生成结果，适合按不同项目要求微调输出结构和语气。</p>
            </div>

            <div class="prompt-help">
              <strong>可用占位符</strong>
              <div class="fact-list">
                <span class="data-chip" v-pre>{{briefSchema}}</span>
                <span class="data-chip" v-pre>{{siteSchema}}</span>
                <span class="data-chip" v-pre>{{userInput}}</span>
                <span class="data-chip" v-pre>{{siteText}}</span>
                <span class="data-chip" v-pre>{{senseMapping}}</span>
                <span class="data-chip" v-pre>{{regulations}}</span>
                <span class="data-chip" v-pre>{{referenceText}}</span>
              </div>
            </div>

            <el-tabs v-model="activePromptTab">
              <el-tab-pane label="任务书提示词" name="brief">
                <div class="panel-stack">
                  <el-form-item label="系统提示词">
                    <el-input
                      :model-value="store.settings.promptTemplates.briefSystemPrompt"
                      type="textarea"
                      :rows="5"
                      @input="store.updatePromptTemplate('briefSystemPrompt', String($event))"
                    />
                  </el-form-item>
                  <el-form-item label="主提示词模板">
                    <el-input
                      :model-value="store.settings.promptTemplates.briefUserPrompt"
                      type="textarea"
                      :rows="16"
                      @input="store.updatePromptTemplate('briefUserPrompt', String($event))"
                    />
                  </el-form-item>
                </div>
              </el-tab-pane>
              <el-tab-pane label="场地分析提示词" name="site">
                <div class="panel-stack">
                  <el-form-item label="系统提示词">
                    <el-input
                      :model-value="store.settings.promptTemplates.siteSystemPrompt"
                      type="textarea"
                      :rows="5"
                      @input="store.updatePromptTemplate('siteSystemPrompt', String($event))"
                    />
                  </el-form-item>
                  <el-form-item label="主提示词模板">
                    <el-input
                      :model-value="store.settings.promptTemplates.siteUserPrompt"
                      type="textarea"
                      :rows="16"
                      @input="store.updatePromptTemplate('siteUserPrompt', String($event))"
                    />
                  </el-form-item>
                </div>
              </el-tab-pane>
            </el-tabs>

            <div class="action-row action-row--between">
              <span class="muted">建议先复制当前模板再做项目级微调。</span>
              <el-button plain @click="store.resetPromptTemplates()">
                恢复默认提示词
              </el-button>
            </div>
          </section>

          <section class="surface-card info-panel">
            <h3 class="section-title">运行说明</h3>
            <ul class="info-list">
              <li>演示模式下使用本地启发式逻辑，适合界面演示与流程联调。</li>
              <li>智能联网模式会直接调用 OpenAI Compatible 接口，需保证浏览器端可访问。</li>
              <li>提示词后台修改后会立即写入本地工作区，下次打开页面仍会保留。</li>
            </ul>
          </section>

          <section class="surface-card info-panel">
            <h3 class="section-title">语义映射预览</h3>
            <div class="mapping-grid">
              <div
                v-for="(value, key) in store.getSenseMappingPreview()"
                :key="key"
                class="mapping-item"
              >
                <strong>{{ key }}</strong>
                <p>{{ value }}</p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

import AppShell from '@/components/layout/AppShell.vue';
import PageHero from '@/components/panels/PageHero.vue';
import { useWorkflowStore } from '@/stores/workflow';

const store = useWorkflowStore();
const activePromptTab = ref('brief');

const runModeOptions = [
  {
    label: '演示模式',
    value: 'demo'
  },
  {
    label: '智能联网',
    value: 'remote'
  }
];

function handleRunModeChange(value: string | number | boolean) {
  store.updateSettings({
    runMode: value === 'remote' ? 'remote' : 'demo'
  });
}

async function handleReset() {
  try {
    await ElMessageBox.confirm(
      '这会清空当前前端工作区缓存，是否继续？',
      '重置确认',
      {
        type: 'warning'
      }
    );
    store.resetWorkspace();
    ElMessage.success('工作区已重置。');
  } catch {
    // 用户取消时保持静默
  }
}
</script>

<style scoped lang="scss">
.settings-grid {
  display: grid;
  grid-template-columns: minmax(320px, 0.92fr) minmax(0, 1.08fr);
  gap: 1rem;
}

.form-panel,
.info-panel {
  padding: 1rem 1.1rem;
}

.grid-two {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
}

.action-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
}

.action-row--between {
  justify-content: space-between;
}

.prompt-help {
  padding: 0.95rem 1rem;
  border-radius: var(--radius-md);
  background: rgba(72, 110, 89, 0.08);
}

.info-list {
  margin: 0;
  padding-left: 1rem;
  color: var(--text-secondary);
}

.mapping-grid {
  display: grid;
  gap: 0.8rem;
}

.mapping-item {
  padding: 0.9rem;
  border-radius: var(--radius-md);
  background: rgba(69, 109, 86, 0.08);
}

.mapping-item p {
  margin: 0.4rem 0 0;
  color: var(--text-secondary);
}

@media (max-width: 1080px) {
  .settings-grid,
  .grid-two {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .action-row--between {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
