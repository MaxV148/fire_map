import {Col, Row, Space} from 'antd';
import * as Icons from '@ant-design/icons';
import React from 'react';
import {useNavigate} from "react-router-dom";
import LocationMap from '../components/map';
import EventsIssuesList from "../components/EventsIssuesList.tsx";
import FilterPanel, {FilterValues} from '../components/FilterPanel.tsx';
import NavBase from "../components/NavBase.tsx";

interface IconProps {
    icon: string;

    [key: string]: any;
}

function Icon(props: IconProps) {
    const IconComponent = Icons[props.icon as keyof typeof Icons] as React.ComponentType<any>;
    return <IconComponent {...props} />;
}


const DashBoard: React.FC = () => {
    const [filters, setFilters] = React.useState<FilterValues>({
        view: 'both'
    });
    const handleFilterChange = (newFilters: FilterValues) => {
        setFilters(newFilters);
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
                />
            </Col>
        </Row>

        <Row gutter={[16, 16]}
             style={{marginTop: '16px', marginLeft: '16px', marginRight: '16px', marginBottom: '16px'}}>
            <Col span={12}>
                <EventsIssuesList filters={filters}/>
            </Col>
            <Col span={12}>
                <FilterPanel onFilterChange={handleFilterChange}/>
            </Col>
        </Row>
    </>
    return (
        <NavBase content={dashboard}/>
    );
};

export default DashBoard;