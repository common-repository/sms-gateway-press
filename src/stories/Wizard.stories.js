import { fn } from '@storybook/test';
import Wizard, { Steps } from '../js/wizard/Wizard.jsx'

export default {
  title: 'Wizard/Welcome',
  component: Wizard,
};

export const WelcomePage = {};

export const CreateDevicePage = {
  args: {
    step: Steps.createDevice,
  },
};

export const InstallAppPage = {
  args: {
    step: Steps.installApp,
  },
};

export const ConnectDevicePage = {
  args: {
    step: Steps.connectDevice,
  },
};

export const SendTestMessagePage = {
  args: {
    step: Steps.sendTestMessage,
  },
};

export const FinishPage = {
  args: {
    step: Steps.finish,
  },
};
