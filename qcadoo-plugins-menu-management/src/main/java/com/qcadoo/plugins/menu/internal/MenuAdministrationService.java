/**
 * ***************************************************************************
 * Copyright (c) 2010 Qcadoo Limited
 * Project: Qcadoo Framework
 * Version: 1.4
 *
 * This file is part of Qcadoo.
 *
 * Qcadoo is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation; either version 3 of the License,
 * or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 * ***************************************************************************
 */
package com.qcadoo.plugins.menu.internal;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.qcadoo.model.api.DataDefinitionService;
import com.qcadoo.model.api.Entity;
import com.qcadoo.model.api.search.CustomRestriction;
import com.qcadoo.model.api.search.SearchCriteriaBuilder;
import com.qcadoo.model.api.search.SearchDisjunction;
import com.qcadoo.model.api.search.SearchRestrictions;
import com.qcadoo.view.api.ComponentState;
import com.qcadoo.view.api.ViewDefinitionState;
import com.qcadoo.view.api.components.FormComponent;
import com.qcadoo.view.api.components.GridComponent;
import com.qcadoo.view.api.utils.TranslationUtilsService;
import com.qcadoo.view.constants.QcadooViewConstants;

@Service
public class MenuAdministrationService {

    private static final String L_PLUGIN_IDENTIFIER = "pluginIdentifier";

    @Autowired
    private DataDefinitionService dataDefinitionService;

    @Autowired
    private TranslationUtilsService translationUtilsService;

    private static final List<String[]> HIDDEN_CATEGORIES = new ArrayList<String[]>();

    static {
        HIDDEN_CATEGORIES.add(new String[] { "qcadooView", "home" });
        HIDDEN_CATEGORIES.add(new String[] { "qcadooView", "administration" });
    }

    public void addRestrictionToCategoriesGrid(final ViewDefinitionState viewDefinitionState) {
        GridComponent categoriesGrid = (GridComponent) viewDefinitionState.getComponentByReference("grid");

        categoriesGrid.setCustomRestriction(new CustomRestriction() {

            @Override
            public void addRestriction(final SearchCriteriaBuilder searchCriteriaBuilder) {
                SearchDisjunction disjunction = SearchRestrictions.disjunction();

                for (String[] category : HIDDEN_CATEGORIES) {
                    disjunction.add(SearchRestrictions.and(SearchRestrictions.eq(L_PLUGIN_IDENTIFIER, category[0]),
                            SearchRestrictions.eq("name", category[1])));
                }

                searchCriteriaBuilder.add(SearchRestrictions.not(disjunction));
            }

        });
    }

    public void translateCategoriesGrid(final ViewDefinitionState viewDefinitionState) {
        GridComponent categoriesGrid = (GridComponent) viewDefinitionState.getComponentByReference("grid");
        for (Entity categoryEntity : categoriesGrid.getEntities()) {
            if (categoryEntity.getStringField(L_PLUGIN_IDENTIFIER) != null) {
                categoryEntity.setField("name",
                        translationUtilsService.getCategoryTranslation(categoryEntity, viewDefinitionState.getLocale()));
            }
        }
    }

    public void translateCategoryForm(final ViewDefinitionState viewDefinitionState) {
        FormComponent categoryForm = (FormComponent) viewDefinitionState.getComponentByReference("form");
        Entity categoryFormEntity = categoryForm.getEntity();
        Entity categoryDbEntity = null;
        if (categoryFormEntity != null && categoryFormEntity.getId() != null) {
            categoryDbEntity = dataDefinitionService.get(QcadooViewConstants.PLUGIN_IDENTIFIER,
                    QcadooViewConstants.MODEL_CATEGORY).get(categoryFormEntity.getId());
        }

        if (categoryDbEntity != null && categoryDbEntity.getStringField(L_PLUGIN_IDENTIFIER) != null) {
            ComponentState categoryNameField = viewDefinitionState.getComponentByReference("categoryName");
            categoryNameField.setEnabled(false);
            categoryNameField.setFieldValue(translationUtilsService.getCategoryTranslation(categoryDbEntity,
                    viewDefinitionState.getLocale()));
        }

        GridComponent categoryItemsGrid = (GridComponent) viewDefinitionState.getComponentByReference("itemsGrid");
        for (Entity itemEntity : categoryItemsGrid.getEntities()) {
            if (itemEntity.getStringField(L_PLUGIN_IDENTIFIER) != null) {
                itemEntity.setField("name",
                        translationUtilsService.getItemTranslation(itemEntity, viewDefinitionState.getLocale()));
            }
        }
    }

    public void translateItemForm(final ViewDefinitionState viewDefinitionState) {
        FormComponent itemForm = (FormComponent) viewDefinitionState.getComponentByReference("form");
        Entity itemEntity = null;
        if (itemForm.getEntity() != null) {
            itemEntity = dataDefinitionService.get(QcadooViewConstants.PLUGIN_IDENTIFIER, QcadooViewConstants.MODEL_ITEM).get(
                    itemForm.getEntity().getId());
        }
        if (itemEntity != null && itemEntity.getStringField(L_PLUGIN_IDENTIFIER) != null) {
            ComponentState itemNameField = viewDefinitionState.getComponentByReference("itemName");
            itemNameField.setEnabled(false);

            // TODO lupo fix problem with menu
            // itemNameField.setFieldValue(translationUtilsService.getItemTranslation(itemEntity,
            // viewDefinitionState.getLocale()));

            viewDefinitionState.getComponentByReference("itemView").setEnabled(false);

            // viewDefinitionState.getComponentByReference("itemActive").setEnabled(false);
        }
    }

}
