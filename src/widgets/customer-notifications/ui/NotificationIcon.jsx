import PropTypes from 'prop-types';

import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ContentPasteOutlinedIcon from '@mui/icons-material/ContentPasteOutlined';
import FactoryOutlinedIcon from '@mui/icons-material/FactoryOutlined';

import { resolveNotificationType } from '../lib/notification-payload';

// Backend types are composite — "<domain>.<action>.<entityId>" — so only the
// first segment is the domain the icon is picked by.
const DOMAIN_ICONS = {
    lead: RouteOutlinedIcon,
    shipping: LocalShippingOutlinedIcon,
    tender: ContentPasteOutlinedIcon,
    factor: FactoryOutlinedIcon,
};

export function NotificationIcon({ notification }) {
    const [domain = ''] = String(resolveNotificationType(notification))
        .toLowerCase()
        .split('.');

    const Icon = DOMAIN_ICONS[domain] || NotificationsNoneOutlinedIcon;

    return <Icon />;
}

NotificationIcon.propTypes = {
    notification: PropTypes.object,
};
