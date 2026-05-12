"use client";

import { useState } from "react";
import type {
  OpenCellPropertiesMenu,
  OpenImageBubbleSubmenu,
  OpenLinkBubbleMode,
  OpenMenu,
  OpenTableBubbleSubmenu,
  OpenTablePropertiesMenu,
} from "../types";

export function useEditorMenuState() {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [openTableBubbleSubmenu, setOpenTableBubbleSubmenu] =
    useState<OpenTableBubbleSubmenu>(null);
  const [openCellPropertiesMenu, setOpenCellPropertiesMenu] =
    useState<OpenCellPropertiesMenu>(null);
  const [openTablePropertiesMenu, setOpenTablePropertiesMenu] =
    useState<OpenTablePropertiesMenu>(null);
  const [openImageBubbleSubmenu, setOpenImageBubbleSubmenu] =
    useState<OpenImageBubbleSubmenu>(null);
  const [isImageAltEditorOpen, setIsImageAltEditorOpen] = useState(false);
  const [openLinkBubbleMode, setOpenLinkBubbleMode] =
    useState<OpenLinkBubbleMode>(null);

  function closeMenu() {
    setOpenMenu(null);
  }

  function toggleMenu(menu: Exclude<OpenMenu, null>) {
    setOpenMenu((currentMenu) => (currentMenu === menu ? null : menu));
  }

  function closeImageBubbleSubmenu() {
    setOpenImageBubbleSubmenu(null);
  }

  function toggleImageBubbleSubmenu(
    menu: Exclude<OpenImageBubbleSubmenu, null>,
  ) {
    setIsImageAltEditorOpen(false);
    setOpenImageBubbleSubmenu((currentMenu) =>
      currentMenu === menu ? null : menu,
    );
  }

  function toggleTableBubbleSubmenu(
    menu: Exclude<OpenTableBubbleSubmenu, null>,
  ) {
    setOpenCellPropertiesMenu(null);
    setOpenTablePropertiesMenu(null);
    setOpenTableBubbleSubmenu((currentMenu) =>
      currentMenu === menu ? null : menu,
    );
  }

  function closeTableBubbleSubmenu() {
    setOpenCellPropertiesMenu(null);
    setOpenTablePropertiesMenu(null);
    setOpenTableBubbleSubmenu(null);
  }

  function closeLinkBubble() {
    setOpenLinkBubbleMode(null);
  }

  function openCellPropertiesView() {
    setOpenCellPropertiesMenu(null);
    setOpenTablePropertiesMenu(null);
    setOpenTableBubbleSubmenu("cell-properties");
  }

  function closeCellPropertiesView() {
    setOpenCellPropertiesMenu(null);
    setOpenTablePropertiesMenu(null);
    setOpenTableBubbleSubmenu(null);
  }

  function openTablePropertiesView() {
    setOpenCellPropertiesMenu(null);
    setOpenTablePropertiesMenu(null);
    setOpenTableBubbleSubmenu("table-properties");
  }

  function closeTablePropertiesView() {
    setOpenCellPropertiesMenu(null);
    setOpenTablePropertiesMenu(null);
    setOpenTableBubbleSubmenu(null);
  }

  function toggleCellPropertiesMenu(
    menu: Exclude<OpenCellPropertiesMenu, null>,
  ) {
    setOpenCellPropertiesMenu((currentMenu) =>
      currentMenu === menu ? null : menu,
    );
  }

  function toggleTablePropertiesMenu(
    menu: Exclude<OpenTablePropertiesMenu, null>,
  ) {
    setOpenTablePropertiesMenu((currentMenu) =>
      currentMenu === menu ? null : menu,
    );
  }

  function closeAllMenus() {
    setOpenMenu(null);
    setOpenCellPropertiesMenu(null);
    setOpenTablePropertiesMenu(null);
    setOpenTableBubbleSubmenu(null);
    setOpenImageBubbleSubmenu(null);
    setIsImageAltEditorOpen(false);
    setOpenLinkBubbleMode(null);
  }

  return {
    closeAllMenus,
    closeCellPropertiesView,
    closeImageBubbleSubmenu,
    closeLinkBubble,
    closeMenu,
    closeTablePropertiesView,
    closeTableBubbleSubmenu,
    isImageAltEditorOpen,
    openCellPropertiesMenu,
    openCellPropertiesView,
    openImageBubbleSubmenu,
    openLinkBubbleMode,
    openMenu,
    openTablePropertiesMenu,
    openTablePropertiesView,
    openTableBubbleSubmenu,
    setIsImageAltEditorOpen,
    setOpenCellPropertiesMenu,
    setOpenImageBubbleSubmenu,
    setOpenLinkBubbleMode,
    setOpenMenu,
    setOpenTablePropertiesMenu,
    setOpenTableBubbleSubmenu,
    toggleCellPropertiesMenu,
    toggleImageBubbleSubmenu,
    toggleMenu,
    toggleTablePropertiesMenu,
    toggleTableBubbleSubmenu,
  };
}
