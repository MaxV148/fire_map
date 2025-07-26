import {Col, Row, Space} from 'antd';
import React, { useState } from 'react';
import LocationMap from '../components/map';
import EventsIssuesList from "../components/EventsIssuesList.tsx";
import FilterPanel, {FilterValues} from '../components/FilterPanel.tsx';
import NavBase from "../components/NavBase.tsx";
import CreateEventIssueModal from '../components/modals/CreateEventIssueModal.tsx';


const DashBoard: React.FC = () => {
    const [filters, setFilters] = React.useState<FilterValues>({
        view: 'both'
    });
    
    // State für das Modal
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalInitialLocation, setModalInitialLocation] = useState<[number, number] | undefined>(undefined);

    const handleFilterChange = (newFilters: FilterValues) => {
        setFilters(newFilters);
    };

    // Handler für Karten-Klicks
    const handleMapClick = (lat: number, lng: number) => {
        setModalInitialLocation([lat, lng]);
        setIsModalVisible(true);
    };

    // Handler für Modal-Events
    const handleModalSuccess = () => {
        setIsModalVisible(false);
        setModalInitialLocation(undefined);
        // Events/Issues neu laden - wird automatisch durch die Stores gemacht
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setModalInitialLocation(undefined);
    };

    const dashboard = <>
        <Space
            size="middle"
            direction="horizontal"
            split="j"
        >
        </Space>

        <Row gutter={[16, 16]}>
            <Col span={24}>
                <LocationMap
                    center={[48.1351, 11.5820]}
                    zoom={12}
                    markers={[
                        {
                            position: [48.1351, 11.5820],
                            title: "München",
                            description: "Hauptstadt von Bayern"
                        }
                    ]}
                    onMapClick={handleMapClick}
                />
            </Col>
        </Row>

        <Row gutter={[16, 16]}
             style={{marginTop: '16px', marginLeft: '16px', marginRight: '16px', marginBottom: '16px'}}>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <FilterPanel onFilterChange={handleFilterChange}/>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <EventsIssuesList filters={filters}/>
            </Col>
        </Row>

        {/* Modal für Event/Issue-Erstellung */}
        <CreateEventIssueModal
            visible={isModalVisible}
            onCancel={handleModalCancel}
            onSuccess={handleModalSuccess}
            initialLocation={modalInitialLocation}
        />
    </>
    return (
        <NavBase content={dashboard}/>
    );
};

export default DashBoard;