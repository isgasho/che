/*
 * Copyright (c) 2015-2018 Red Hat, Inc.
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */
'use strict';
import {IPlugin, PluginRegistry} from '../../../../components/api/plugin-registry.factory';
import IWorkspaceConfig = che.IWorkspaceConfig;
import {CheNotification} from '../../../../components/notification/che-notification.factory';

const PLUGIN_SEPARATOR = ',';
const PLUGIN_VERSION_SEPARATOR = ':';
const EDITOR_TYPE = 'Che Editor';

/**
 * @ngdoc controller
 * @name workspaces.details.editors.controller:WorkspaceEditorsController
 * @description This class is handling the controller for details of workspace : section editors
 * @author Ann Shumilova
 */
export class WorkspaceEditorsController {
  static $inject = ['pluginRegistry', 'cheListHelperFactory', '$scope', 'cheNotification'];

  workspaceConfig: IWorkspaceConfig;
  pluginRegistryLocation: string;

  pluginRegistry: PluginRegistry;
  cheNotification: CheNotification;
  onChange: Function;
  isLoading: boolean;

  editorOrderBy = 'name';
  editors: Array<IPlugin> = [];
  selectedEditor: string = '';
  editorFilter: any;

  private cheListHelper: che.widget.ICheListHelper;

  /**
   * Default constructor that is using resource
   */
  constructor(pluginRegistry: PluginRegistry, cheListHelperFactory: che.widget.ICheListHelperFactory, $scope: ng.IScope,
              cheNotification: CheNotification) {
    this.pluginRegistry = pluginRegistry;
    this.cheNotification = cheNotification;

    const helperId = 'workspace-editors';
    this.cheListHelper = cheListHelperFactory.getHelper(helperId);

    $scope.$on('$destroy', () => {
      cheListHelperFactory.removeHelper(helperId);
    });

    this.editorFilter = {name: ''};

    const deRegistrationFn = $scope.$watch(() => {
      return this.workspaceConfig;
    }, (workspaceConfig: IWorkspaceConfig) => {
      if (!workspaceConfig) {
        return;
      }
      this.updateEditors();
    }, true);

    $scope.$on('$destroy', () => {
      deRegistrationFn();
    });

    this.loadPlugins();
  }

  /**
   * Loads the list of plugins from registry.
   */
  loadPlugins(): void {
    this.editors = [];
    this.isLoading = true;
    this.pluginRegistry.fetchPlugins(this.pluginRegistryLocation).then((result: Array<IPlugin>) => {
      this.isLoading = false;
      result.forEach((item: IPlugin) => {
        if (item.type === EDITOR_TYPE) {
          this.editors.push(item);
        };
      });  

      this.updateEditors();
    }, (error: any) => {
      this.isLoading = false;
      this.cheNotification.showError(error.data && error.data.message ? error.data.message : 'Failed to load plugins.');
    });
  }

  /**
   * Callback when name is changed.
   *
   * @param str {string} a string to filter projects names
   */
  onSearchChanged(str: string): void {
    this.editorFilter.name = str;
    this.cheListHelper.applyFilter('name', this.editorFilter);
  }

  /**
   * Update plugin information based on UI changes.
   *
   * @param {IPlugin} plugin
   */
  updateEditor(plugin: IPlugin): void {
    let name = plugin.id + PLUGIN_VERSION_SEPARATOR + plugin.version;

    if (plugin.type === EDITOR_TYPE) {
      this.selectedEditor = plugin.isEnabled ? name : '';
      this.workspaceConfig.attributes.editor = this.selectedEditor;
    }
    
    this.cleanupInstallers();
    this.onChange();
  }

  /**
   * Clean up all the installers in all machines, when plugin is selected.
   */
  cleanupInstallers(): void {
    let defaultEnv : string = this.workspaceConfig.defaultEnv;
    let machines : any = this.workspaceConfig.environments[defaultEnv].machines;
    let machineNames : Array<string> = Object.keys(machines);
    machineNames.forEach((machineName: string) => {
      machines[machineName].installers = [];
    });
  }

  /**
   * Update the state of plugins.
   */
  private updateEditors(): void {
    // get selected plugins from workspace configuration attribute - "editor":
    this.selectedEditor = this.workspaceConfig && this.workspaceConfig.attributes && this.workspaceConfig.attributes.editor ?
     this.workspaceConfig.attributes.editor : '';

     // check each editor's enabled state:
    this.editors.forEach((editor: IPlugin) => {
      editor.isEnabled = this.isEditorEnabled(editor);
    });

    this.cheListHelper.setList(this.editors, 'name');
  }

  /**
   *
   * @param {IPlugin} plugin
   * @returns {boolean} the editor's enabled state
   */
  private isEditorEnabled(editor: IPlugin): boolean {
    // name in the format: id:version
    let name = editor.id + PLUGIN_VERSION_SEPARATOR + editor.version;
    return name === this.selectedEditor;
  }
}
