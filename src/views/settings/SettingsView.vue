<template>
  <AppShell>
    <div class="page-grid">
      <PageHero
        kicker="Settings"
        title="项目参数、提示词后台与调试入口"
        description="不只换皮，也把设置页改成左侧配置、中间提示词、右侧说明与预览的工作台布局。"
      >
        <template #aside>
          <div class="hero-summary">
            <div class="hero-summary__item">
              <span class="section-caption">运行模式</span>
              <strong>{{ store.settings.runMode === 'remote' ? 'Remote' : 'Demo' }}</strong>
            </div>
            <div class="hero-summary__item">
              <span class="section-caption">检索条数</span>
              <strong>{{ store.settings.retrievalTopK }}</strong>
            </div>
          </div>
        </template>
      </PageHero>

      <section class="settings-stage">
        <section class="surface-card stage-panel stage-panel--control">
          <div>
            <span class="section-caption">Control</span>
            <h3 class="section-title">工作区设置</h3>
            <p class="muted">维护项目名、运行模式和模型连接配置。</p>
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

        <section class="surface-card stage-panel stage-panel--prompt">
          <div>
            <span class="section-caption">Prompt Studio</span>
            <h3 class="section-title">提示词后台</h3>
            <p class="muted">这里直接影响远程生成结果的结构与语气。</p>
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
            <span class="muted">建议先复制当前模板，再做项目级微调。</span>
            <el-button plain @click="store.resetPromptTemplates()">
              恢复默认提示词
            </el-button>
          </div>
        </section>

        <aside class="settings-side">
          <section class="surface-card stage-panel">
            <div>
              <span class="section-caption">Run Notes</span>
              <h3 class="section-title">运行说明</h3>
            </div>
            <ul class="info-list">
              <li>演示模式使用本地启发式逻辑，适合界面展示与流程联调。</li>
              <li>远程模式会直接请求 OpenAI Compatible 接口，需保证浏览器可访问。</li>
              <li>提示词后台修改后会立即写入本地工作区，下次打开仍会保留。</li>
            </ul>
          </section>

          <section class="surface-card stage-panel stage-panel--note">
            <span class="section-caption">Prompt Focus</span>
            <strong>把配置区、提示词区和辅助说明拆开，保持设置页的节奏更清晰。</strong>
          </section>

          <section class="surface-card stage-panel">
            <div>
              <span class="section-caption">Sense Mapping</span>
              <h3 class="section-title">语义映射预览</h3>
            </div>
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
        </aside>
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
    label: '远程模型',
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
    await ElMessageBox.confirm('这会清空当前前端工作区缓存，是否继续？', '重置确认', {
      type: 'warning'
    });
    store.resetWorkspace();
    ElMessage.success('工作区已重置。');
  } catch {
    // ignore cancel
  }
}
</script>

<style scoped lang="scss">
.settings-stage {
  display: grid;
  grid-template-columns: minmax(300px, 0.74fr) minmax(0, 1.1fr) minmax(280px, 0.62fr);
  gap: 1rem;
}

.stage-panel {
  padding: 1.15rem 1.2rem;
  background:
    radial-gradient(circle at top right, rgba(216, 203, 171, 0.16), transparent 26%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.54), rgba(241, 240, 232, 0.42)),
    rgba(255, 252, 246, 0.42);
}

.settings-side {
  display: grid;
  gap: 1rem;
}

.stage-panel--note {
  align-content: center;
  border-radius: 46% 54% 49% 51% / 44% 42% 58% 56%;
}

.stage-panel--note strong {
  font-family: var(--font-display);
  font-size: 1.34rem;
  line-height: 1.2;
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
  border-radius: var(--radius-lg);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.62), rgba(239, 238, 230, 0.46)),
    rgba(255, 252, 246, 0.4);
  border: 1px solid rgba(113, 132, 109, 0.08);
  box-shadow: var(--shadow-soft);
}

.info-list {
  margin: 0.8rem 0 0;
  padding-left: 1rem;
  color: var(--text-secondary);
}

.mapping-grid {
  display: grid;
  gap: 0.8rem;
  margin-top: 0.9rem;
}

.mapping-item {
  padding: 0.95rem 1rem;
  border-radius: var(--radius-lg);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.62), rgba(240, 239, 231, 0.46)),
    rgba(255, 252, 246, 0.38);
  border: 1px solid rgba(113, 132, 109, 0.08);
  box-shadow: var(--shadow-soft);
}

.mapping-item p {
  margin: 0.35rem 0 0;
  color: var(--text-secondary);
}

.hero-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.hero-summary__item {
  display: grid;
  gap: 0.35rem;
  padding: 0.9rem 1rem;
  border-radius: 44% 56% 48% 52% / 46% 41% 59% 54%;
  border: 1px solid rgba(113, 132, 109, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.65), rgba(239, 238, 230, 0.44)),
    rgba(255, 252, 246, 0.4);
  box-shadow: var(--shadow-soft);
}

.hero-summary__item strong {
  font-size: 1.8rem;
  line-height: 1;
  font-family: var(--font-display);
  word-break: break-word;
}

@media (max-width: 1280px) {
  .settings-stage {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .grid-two,
  .hero-summary {
    grid-template-columns: 1fr;
  }

  .action-row--between {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
