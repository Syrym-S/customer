import { Box } from '@mui/material';
import PropTypes from 'prop-types';

import { InfoBadge } from '../components/InfoBadge';
import { StepSection } from '../components/StepSection';

function getLocationDisplay(location, fallback) {
    if (location?.address) {
        return location.address;
    }

    return fallback || 'Не указано';
}

function getFormCargos(form) {
    return Array.isArray(form.cargos) ? form.cargos : [];
}

function getDimensionsDisplay(cargo) {
    const length = cargo.length_cm;
    const width = cargo.width_cm;
    const height = cargo.height_cm;

    if (!length && !width && !height) {
        return 'Не указано';
    }

    return `${length || '—'} × ${width || '—'} × ${height || '—'} см`;
}

export function ConfirmStep({ form }) {
    const selectedForwarder = form.forwarder;
    const cargos = getFormCargos(form);

    return (
        <Box sx={{ display: 'grid', gap: 2 }}>
            <StepSection title="Проверьте данные">
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: '1fr 1fr',
                        },
                        gap: 1,
                    }}
                >
                    <InfoBadge
                        label="Откуда"
                        value={getLocationDisplay(
                            form.from_location,
                            form.fromLocation,
                        )}
                    />

                    <InfoBadge
                        label="Куда"
                        value={getLocationDisplay(
                            form.to_location,
                            form.toLocation,
                        )}
                    />

                    <InfoBadge label="Дата загрузки" value={form.loadingDate} />

                    <Box
                        sx={{
                            gridColumn: {
                                xs: 'auto',
                                sm: '1 / -1',
                            },
                            display: 'grid',
                            gap: 1,
                        }}
                    >
                        {cargos.map((cargo, index) => (
                            <Box
                                key={`${cargo.name || cargo.type || 'cargo'}-${index}`}
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        sm: 'repeat(2, 1fr)',
                                    },
                                    gap: 1,
                                }}
                            >
                                <InfoBadge
                                    label={`Груз #${index + 1}`}
                                    value={cargo.name || 'Не указано'}
                                />

                                <InfoBadge
                                    label="Тип груза"
                                    value={cargo.type || 'Не указан'}
                                />

                                <InfoBadge
                                    label="Вес"
                                    value={
                                        cargo.weight_kg
                                            ? `${cargo.weight_kg} кг`
                                            : 'Не указано'
                                    }
                                />

                                <InfoBadge
                                    label="Цена груза"
                                    value={
                                        cargo.cargo_price
                                            ? `${cargo.cargo_price} ${form.currency || ''}`.trim()
                                            : 'Не указано'
                                    }
                                />

                                <InfoBadge
                                    label="Размеры"
                                    value={getDimensionsDisplay(cargo)}
                                />
                            </Box>
                        ))}
                    </Box>

                    <InfoBadge
                        label="Цена исполнения"
                        value={
                            form.price
                                ? `${form.price} ${form.currency || ''}`.trim()
                                : 'Не указано'
                        }
                        accent
                    />
                </Box>
            </StepSection>

            <StepSection title="Экспедитор">
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                        },
                        gap: 1.5,
                    }}
                >
                    <InfoBadge
                        label="ФИО экспедитора"
                        value={selectedForwarder?.fullName || 'Не выбран'}
                    />
                    <InfoBadge
                        label="ИИН экспедитора"
                        value={selectedForwarder?.iin || '—'}
                    />
                    <InfoBadge
                        label="Компания"
                        value={selectedForwarder?.companyName || '—'}
                    />
                    <InfoBadge
                        label="БИН компании"
                        value={selectedForwarder?.companyBin || '—'}
                    />
                    <InfoBadge
                        label="Телефон"
                        value={selectedForwarder?.phone || '—'}
                    />
                </Box>
            </StepSection>

            <StepSection title="Документы">
                {form.documents?.length ? (
                    <Box
                        sx={{
                            display: 'grid',
                            gap: 1,
                        }}
                    >
                        {form.documents.map((document) => (
                            <InfoBadge
                                key={document.id}
                                label={document.name || 'Документ'}
                                value={document.fileName || 'Файл'}
                            />
                        ))}
                    </Box>
                ) : (
                    <InfoBadge label="Документы" value="Не добавлены" />
                )}
            </StepSection>
        </Box>
    );
}

ConfirmStep.propTypes = {
    form: PropTypes.object.isRequired,
};
