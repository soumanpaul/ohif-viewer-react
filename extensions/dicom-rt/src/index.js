import React from 'react';

import init from './init.js';
import sopClassHandlerModule from './OHIFDicomRTStructSopClassHandler';
import id from './id.js';
import RTPanel from './components/RTPanel/RTPanel';

export default {
  /**
   * Only required property. Should be a unique value across all extensions.
   */
  id,

  /**
   *
   *
   * @param {object} [configuration={}]
   * @param {object|array} [configuration.csToolsConfig] - Passed directly to `initCornerstoneTools`
   */
  preRegistration({ servicesManager, configuration = {} }) {
    init({ servicesManager, configuration });
  },
  getPanelModule({ commandsManager, servicesManager, api }) {
    const { UINotificationService } = servicesManager.services;

    const ExtendedRTPanel = props => {
      const { activeContexts } = api.hooks.useAppContext();

      const noContoursNotificationHandler = () => {
        UINotificationService.show({
          title: 'ROI Contour empty',
          message: 'The ROI contour has no structure set data.',
          type: 'error',
          autoClose: false,
        });
      };

      const contourItemClickHandler = contourData => {
        commandsManager.runCommand('jumpToImage', contourData);
      };

      return (
        <RTPanel
          {...props}
          onContourItemClick={contourItemClickHandler}
          activeContexts={activeContexts}
          contexts={api.contexts}
          noContoursNotification={noContoursNotificationHandler}
        />
      );
    };

    return {
      menuOptions: [
        {
          icon: 'list',
          label: 'RTSTRUCT',
          target: 'rt-panel',
          isDisabled: studies => {
            if (!studies) {
              return true;
            }

            for (let i = 0; i < studies.length; i++) {
              const study = studies[i];

              if (study && study.series) {
                for (let j = 0; j < study.series.length; j++) {
                  const series = study.series[j];
                  if (
                    /* Could be expanded to contain RTPLAN and RTDOSE information in the future */
                    ['RTSTRUCT'].includes(series.Modality)
                  ) {
                    return false;
                  }
                }
              }
            }

            return true;
          },
        },
      ],
      components: [
        {
          id: 'rt-panel',
          component: ExtendedRTPanel,
        },
      ],
      defaultContext: ['VIEWER'],
    };
  },
  getSopClassHandlerModule({ servicesManager }) {
    return sopClassHandlerModule;
  },
};
