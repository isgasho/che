/*
 * Copyright (c) 2012-2017 Red Hat, Inc.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */

package org.eclipse.che.ide.js.api.action;

import jsinterop.annotations.JsType;

/**
 * A manager for actions. Used to register action handlers.
 */
@JsType(isNative = true)
public interface ActionManager {

  /**
   * Register action handlers.
   * @param actionId the action id
   * @param updateAction the update handler
   * @param performAction the perform handler
   */
  void registerAction(String actionId, UpdateAction updateAction, PerformAction performAction);
}
