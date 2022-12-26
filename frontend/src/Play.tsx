import { useCallback, useEffect, useState } from 'react';
import { generate } from './generate';
import { Button, Col, ConfigProvider, Layout, Popover, Row, Select, Space, Switch, theme, Timeline, Typography } from 'antd';
import { CompassOutlined, GoogleOutlined, ReloadOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import { Content, Footer } from 'antd/es/layout/layout';
import { prettyPrint, toGeoHackLink, toGoogleMapsLink } from './coords';
import { useDispatch, useSelector } from 'react-redux';
import { finishRound, HistoryItem, replayRound, selectHistory, selectImgSrc, selectLabelsOn, setNewRound, View } from './store';
import * as store from './store';

const firstSpawnMap = 'Urban';

function Play() {
    const [spawnMap, setSpawnMap] = useState(firstSpawnMap);

    const dispatch = useDispatch();
    const imgSrc = useSelector(selectImgSrc);
    const viewHistory = useSelector(selectHistory);
    const view = useSelector((state: store.RootState) => state.view);
    const labels = useSelector(selectLabelsOn);

    const zoomOut = useCallback(() => dispatch(store.zoomOut()), [dispatch]);
    const zoomIn = useCallback(() => dispatch(store.zoomIn()), [dispatch]);
    const setLabels = useCallback((on: boolean) => dispatch(store.setLabels(on)), [dispatch]);


    const newRound = useCallback(async () => {
        dispatch(finishRound());
        const [currentView, maxZoom] = await generate(spawnMap);
        dispatch(setNewRound([currentView, maxZoom, spawnMap]));
    }, [dispatch, spawnMap]);

    const startReplay = useCallback((idx: number) => {
        dispatch(finishRound());
        dispatch(replayRound(idx));
    }, [dispatch]);

    useEffect(() => {
        newRound();
    }, []);

    const { Text, Title } = Typography;

    return (
        <ConfigProvider
            theme={{
                "token": {
                    "colorPrimary": "#611ede",
                    "colorLink": "#635eff",
                    "colorLinkHover": "#524fbd",
                    "borderRadius": 2
                },
                "algorithm": theme.darkAlgorithm,
            }}
        >

            <Layout style={{ minHeight: '100vh' }}>
                <Title id='title'>Geo Zoom Game</Title>
                <Content>
                    <div id='content'>
                        <Text style={{ fontSize: '14px' }}>
                            You are placed in a random location, zoom out to see how long
                            it takes you to figure out where you are.
                            Select a different map to change the location generator starting from the next round.
                        </Text><br />
                        <img src={imgSrc} alt='satellite view' id='satellite-image' width={'100%'} />
                        <Space direction='vertical' style={{ width: '100%' }}>
                            <Row gutter={7}>
                                <Col span={12}>
                                    <Button type='primary' icon={<ZoomOutOutlined />} onClick={zoomOut} block>
                                        Zoom Out
                                    </Button>
                                </Col>
                                <Col span={12}>
                                    <Button icon={<ZoomInOutlined />} onClick={zoomIn} block>
                                        Zoom In
                                    </Button>
                                </Col>

                            </Row>
                            <Row gutter={7}>
                                <Col span={12}>
                                    <Button icon={<ReloadOutlined />} onClick={newRound} block>
                                        New Round
                                    </Button>
                                </Col>
                                <Col span={4} style={{ textAlign: 'right', paddingRight: 8 }}>
                                    <Text style={{ fontSize: '13px' }}>Map</Text>
                                </Col>
                                <Col span={8}>
                                    <Select
                                        defaultValue={firstSpawnMap}
                                        onChange={setSpawnMap}
                                        style={{ width: '100%' }}
                                    >
                                        <Select.Option value="Urban" title="">Urban</Select.Option>
                                        <Select.Option value="Random" title="">Random</Select.Option>
                                        <Select.Option value="Earth View" title="">Earth View</Select.Option>
                                    </Select>
                                </Col>
                            </Row>
                            <Row gutter={7}>
                                <Col span={12}>
                                    <Popover placement='bottom' content={<CoordsPopover view={view} />} trigger={view ? "click" : []}>
                                        <Button icon={<CompassOutlined />} block>
                                            Coordinates
                                        </Button>
                                    </Popover>
                                </Col>
                                <Col span={4} style={{ textAlign: 'right', paddingRight: 8 }}>
                                    <Text style={{ fontSize: '13px' }}>Labels</Text>
                                </Col>
                                <Col span={8}>
                                    <Switch onChange={setLabels} checked={labels} />
                                </Col>
                            </Row>
                        </Space>

                        <br />
                        <br />
                        <ViewHistory history={viewHistory} startReplay={startReplay} />
                    </div>
                </Content>
                <Footer style={{ textAlign: 'right' }}><a href="https://pascalsommer.ch/">Pascal Sommer</a>, 2022</Footer>
            </Layout>
        </ConfigProvider>
    );
};

const CoordsPopover = ({ view }: { view?: View }) => {
    if (!view) return null;

    const { Text, Link } = Typography;
    return <Space direction='vertical' align='center'>
        <Text copyable code>{prettyPrint(view.coords)}</Text>
        <Link href={toGoogleMapsLink(view.coords)}><GoogleOutlined /> Open in Google Maps</Link>
        <Link href={toGeoHackLink(view.coords)}>Open in GeoHack</Link>
    </Space>;
};

type ReplayButtonProps = {
    onClick: () => void,
};
const ReplayButton = ({ onClick }: ReplayButtonProps) => (
    <Button icon={<ReloadOutlined />} style={{ height: '22px', padding: '0 10px' }} onClick={onClick} type='link'>
        replay
    </Button>
);

type ViewHistoryProps = {
    history: HistoryItem[],
    startReplay: (idx: number) => void,
};
const ViewHistory = ({ history, startReplay }: ViewHistoryProps) => {
    const { Text } = Typography;
    return <Timeline>
        {history.slice().reverse().map((item, idx) => {
            const { spawnMap, finishData } = item;
            const roundIdx = history.length - idx - 1;

            let replay = null;
            let detail = null;
            if (finishData) {
                replay = <ReplayButton onClick={() => startReplay(roundIdx)} />;

                const dist = finishData.viewDiagonal;
                const distStr = dist.toFixed(dist >= 1000 ? 0 : 2);
                detail = <Text>&ndash; {distStr}km view</Text>;
            }

            return <Timeline.Item key={roundIdx}>
                <Text>Round {roundIdx + 1} {replay}<br /></Text>
                <Text type='secondary'>{spawnMap}</Text> {detail}
            </Timeline.Item>;
        })}
    </Timeline>
}

export default Play;
