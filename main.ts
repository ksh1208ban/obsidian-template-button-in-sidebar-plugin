// Obsidian과 관련된 여러 모듈을 임포트합니다.
import {
	App, // 앱 인터페이스
	Editor, // 에디터 인터페이스
	MarkdownView, // 마크다운 뷰 인터페이스
	Modal, // 모달 인터페이스
	Notice, // 알림 인터페이스
	Plugin, // 플러그인 인터페이스
	PluginSettingTab, // 플러그인 설정 탭 인터페이스
	Setting, // 설정 인터페이스
	Workspace, // 작업공간 인터페이스
	EditorPosition, // 에디터 위치 인터페이스
  } from 'obsidian';

// 사이드 패널 제어 뷰와 관련된 모듈을 임포트합니다.
import {
	SidePanelControlView,
	SidePanelControlViewType,
  } from './SidePanelControlView';
  
// 리전 설정을 위한 인터페이스 정의
interface RegionSetting {
	name: string; // 리전의 이름
	active: boolean; // 활성화 여부
	visible: boolean; // 보이는지 여부
  }
  
  // 플러그인 설정을 위한 인터페이스 정의
  export interface PluginSettings {
	templateFolder: string;
	sidePaneSideLeft: Boolean; // 사이드 패널이 왼쪽에 위치하는지 여부
  }

// 기본 설정값 정의
const DEFAULT_SETTINGS: PluginSettings = {
	templateFolder: '',
	sidePaneSideLeft: false,
  };

export default class TemplateButtonInSidebar extends Plugin {
	settings: PluginSettings; // 설정
	private sidePanelControlView: SidePanelControlView; // 사이드 패널 제어 뷰 인스턴스

  // 플러그인 로드 시 실행될 함수
  async onload() 
  {
	console.log('loading TemplateButtonInSidebar');
    // 설정을 로드합니다.
    await this.loadSettings();
	
    // 사이드 패널 뷰를 등록합니다.
	this.registerView(SidePanelControlViewType, (leaf) => {
		this.sidePanelControlView = new SidePanelControlView(leaf, this);
		return this.sidePanelControlView;
	  });
    // 리본 아이콘을 추가하고 클릭 시 사이드 패널 제어 뷰를 토글합니다.
    this.addRibbonIcon('tv', 'Open template button in sidebar', () => 
	{
		this.toggleSidePanelControlView();
	});
	// 설정 탭을 추가합니다.
	this.addSettingTab(new SettingsTab(this.app, this));
  }

  // 플러그인 언로드 시 실행될 함수 (비워져 있음)
  onunload() 
  {

  }
  // 설정을 로드하는 함수
  async loadSettings() 
  {
    this.settings = Object.assign(DEFAULT_SETTINGS, await this.loadData());
  }

  // 설정을 저장하는 함수
  async saveSettings() 
  {
    await this.saveData(this.settings);
  }

  // 사이드 패널 제어 뷰를 토글하는 비공개 함수
  private readonly toggleSidePanelControlView = async (): Promise<void> => 
  {
   	this.app.workspace.detachLeavesOfType(SidePanelControlViewType);

    if (this.settings.sidePaneSideLeft) 
	{
      await this.app.workspace.getLeftLeaf(false).setViewState
	  	({
			type: SidePanelControlViewType,
			active: true,
      	});
    } 
	else 
	{
      await this.app.workspace.getRightLeaf(false).setViewState
	  	({	
			type: SidePanelControlViewType,
			active: true,
    	});
    }

    this.app.workspace.revealLeaf
	(
      this.app.workspace.getLeavesOfType(SidePanelControlViewType)[0],
    );
  };
}

// 설정 탭 클래스 정의
class SettingsTab extends PluginSettingTab {
	plugin: TemplateButtonInSidebar; // 플러그인 인스턴스

	// 생성자
	constructor(app: App, plugin: TemplateButtonInSidebar)
	{
		super(app, plugin);
		this.plugin = plugin;
	}

	// 설정 탭이 닫힐 때 실행될 함수
	close() 
	{
		console.log('closed');
		super.hide();
	}

	// 설정 탭을 표시하는 함수
	async display() 
	{
		let { containerEl } = this;
		containerEl.empty();

		// 템플릿 폴더 설정 추가
		new Setting(containerEl)
			.setName('템플릿 폴더 경로')
			.setDesc('템플릿 파일을 저장할 폴더의 경로를 설정하세요.')
			.addText(text => text
				.setPlaceholder('예: Templates')
				.setValue(this.plugin.settings.templateFolder)
				.onChange(async (value) => {
					this.plugin.settings.templateFolder = value;
					await this.plugin.saveSettings();
				}));
	}

}
