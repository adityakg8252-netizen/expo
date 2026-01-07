import { ConfigPlugin, InfoPlist, withEntitlementsPlist } from '@expo/config-plugins';

interface AppGroupEntitlementsProps {
  bundleIdentifier: string;
  targetName: string;
  groupIdentifier: string;
}

const withAppGroupEntitlements: ConfigPlugin<AppGroupEntitlementsProps> = (
  config,
  { bundleIdentifier, targetName, groupIdentifier }
) =>
  withEntitlementsPlist(config, (config) => {
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
                    ...config.extra?.eas?.build?.experimental?.ios?.appExtensions?.find(
                      (ext: any) => ext.targetName === targetName
                    )?.entitlements,
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
      entitlements: _addApplicationGroupsEntitlement(
        config.ios?.entitlements ?? {},
        groupIdentifier
      ),
    };

    return config;
  });

export default withAppGroupEntitlements;

function _getWidgetExtensionEntitlements(groupIdentifier?: string) {
  return _addApplicationGroupsEntitlement({}, groupIdentifier);
}

function _addApplicationGroupsEntitlement(entitlements: InfoPlist, groupIdentifier?: string) {
  if (!groupIdentifier) {
    return entitlements;
  }

  const existingApplicationGroups =
    (entitlements['com.apple.security.application-groups'] as string[]) ?? [];

  if (!existingApplicationGroups.includes(groupIdentifier)) {
    entitlements['com.apple.security.application-groups'] = [
      groupIdentifier,
      ...existingApplicationGroups,
    ];
  }

  return entitlements;
}
