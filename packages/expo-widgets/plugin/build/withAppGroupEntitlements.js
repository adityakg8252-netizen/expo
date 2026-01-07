"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const withAppGroupEntitlements = (config, { bundleIdentifier, targetName, groupIdentifier }) => (0, config_plugins_1.withEntitlementsPlist)(config, (config) => {
    config.extra = {
        ...config.extra,
        eas: {
            ...config.extra?.eas,
            build: {
                ...config.extra?.eas?.build,
                experimental: {
                    ...config.extra?.eas?.build?.experimental,
                    ios: {
                        ...config.extra?.eas?.build?.experimental?.ios,
                        appExtensions: [
                            ...(config.extra?.eas?.build?.experimental?.ios?.appExtensions ?? []),
                            {
                                targetName,
                                bundleIdentifier,
                                entitlements: {
                                    ...config.extra?.eas?.build?.experimental?.ios?.appExtensions?.find((ext) => ext.targetName === targetName)?.entitlements,
                                    ..._getWidgetExtensionEntitlements(groupIdentifier),
                                },
                            },
                        ],
                    },
                },
            },
        },
    };
    config.ios = {
        ...config.ios,
        entitlements: _addApplicationGroupsEntitlement(config.ios?.entitlements ?? {}, groupIdentifier),
    };
    return config;
});
exports.default = withAppGroupEntitlements;
function _getWidgetExtensionEntitlements(groupIdentifier) {
    return _addApplicationGroupsEntitlement({}, groupIdentifier);
}
function _addApplicationGroupsEntitlement(entitlements, groupIdentifier) {
    if (!groupIdentifier) {
        return entitlements;
    }
    const existingApplicationGroups = entitlements['com.apple.security.application-groups'] ?? [];
    if (!existingApplicationGroups.includes(groupIdentifier)) {
        entitlements['com.apple.security.application-groups'] = [
            groupIdentifier,
            ...existingApplicationGroups,
        ];
    }
    return entitlements;
}
