import React, { useState, useEffect, useCallback } from 'react';
import {
    SafeAreaView,
    Text,
    View,
    Image,
    StyleSheet,
    TextInput,
    Keyboard,
    KeyboardAvoidingView,
    TouchableOpacity,
    ScrollView,
    Button,
    ActivityIndicator, NativeEventEmitter, DeviceEventEmitter, PermissionsAndroid, ToastAndroid
} from 'react-native';

// import { PERMISSIONS, requestMultiple, RESULTS } from 'react-native-permissions';
// import styles from '../css/styles';
// import { colors } from '../constants';
// import Icon from 'react-native-vector-icons/FontAwesome';
import {
    BluetoothManager,
    BluetoothEscposPrinter,
    BluetoothTscPrinter,
    NetPrinter
  } from "react-native-bluetooth-nest-printer";
import SamplePrint from './SamplePrint';
import ItemList from './ItemList';

export const PORT = '9100';

const FindPrinter = () => {
    const [pairedDevices, setPairedDevices] = useState([]);
    const [foundDs, setFoundDs] = useState([]);
    const [bleOpend, setBleOpend] = useState(false);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [boundAddress, setBoundAddress] = useState('');
    console.log('foundDs: ', foundDs)

    const [selectedNetPrinter, setSelectedNetPrinter] = useState({
      device_name: 'My Net Printer',
      host: '192.168.1.212',
      port: PORT,
      printerType: 'net',
    });


    useEffect(() => {
        BluetoothManager.isBluetoothEnabled().then(
            (enabled) => {
                setBleOpend(Boolean(enabled));
                setLoading(false);
            },
            (err) => {
                err;
            }
        );

        if (Platform.OS === 'ios') {
            let bluetoothManagerEmitter = new NativeEventEmitter(
                BluetoothManager
            );
            bluetoothManagerEmitter.addListener(
                BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED,
                (rsp) => {
                    deviceAlreadPaired(rsp);
                }
            );
            bluetoothManagerEmitter.addListener(
                BluetoothManager.EVENT_DEVICE_FOUND,
                (rsp) => {
                    deviceFoundEvent(rsp);
                }
            );
            bluetoothManagerEmitter.addListener(
                BluetoothManager.EVENT_CONNECTION_LOST,
                () => {
                    setName('');
                    setBoundAddress('');
                }
            );
        } else if (Platform.OS === 'android') {
            DeviceEventEmitter.addListener(
                BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED,
                (rsp) => {
                    deviceAlreadPaired(rsp);
                }
            );
            DeviceEventEmitter.addListener(
                BluetoothManager.EVENT_DEVICE_FOUND,
                (rsp) => {
                    deviceFoundEvent(rsp);
                }
            );
            DeviceEventEmitter.addListener(
                BluetoothManager.EVENT_CONNECTION_LOST,
                () => {
                    setName('');
                    setBoundAddress('');
                }
            );
            DeviceEventEmitter.addListener(
                BluetoothManager.EVENT_BLUETOOTH_NOT_SUPPORT,
                () => {
                    ToastAndroid.show(
                        'Thiết bị không hỗ trợ bluetooth',
                        ToastAndroid.LONG
                    );
                }
            );
        }
        if (pairedDevices.length < 1) {
            scan();
        }
    }, [
        boundAddress,
        deviceAlreadPaired,
        deviceFoundEvent,
        pairedDevices,
        scan,
    ]);

    const deviceAlreadPaired = useCallback(
        (rsp) => {
            var ds = null;
            if (typeof rsp.devices === 'object') {
                ds = rsp.devices;
            } else {
                try {
                    ds = JSON.parse(rsp.devices);
                } catch (e) {}
            }
            if (ds && ds.length) {
                let pared = pairedDevices;
                if (pared.length < 1) {
                    pared = pared.concat(ds || []);
                }
                setPairedDevices(pared);
            }
        },
        [pairedDevices]
    );

    const deviceFoundEvent = useCallback(
        (rsp) => {
            var r = null;
            try {
                if (typeof rsp.device === 'object') {
                    r = rsp.device;
                } else {
                    r = JSON.parse(rsp.device);
                }
            } catch (e) {
                // ignore error
            }

            if (r) {
                let found = foundDs || [];
                if (found.findIndex) {
                    let duplicated = found.findIndex(function (x) {
                        return x.address == r.address;
                    });
                    if (duplicated == -1) {
                        found.push(r);
                        setFoundDs(found);
                    }
                }
            }
        },
        [foundDs]
    );

    const connect = (row) => {
        setLoading(true);
        BluetoothManager.connect(row.address).then(
            (s) => {
                setLoading(false);
                setBoundAddress(row.address);
                setName(row.name || 'UNKNOWN');
            },
            (e) => {
                setLoading(false);
                alert(e);
            }
        );
    };

    const unPair = (address) => {
        setLoading(true);
        BluetoothManager.unpaire(address).then(
            (s) => {
                setLoading(false);
                setBoundAddress('');
                setName('');
            },
            (e) => {
                setLoading(false);
                alert(e);
            }
        );
    };

    const scanDevices = useCallback(() => {
        setLoading(true);
        BluetoothManager.scanDevices().then(
            (s) => {
                // const pairedDevices = s.paired;
                var found = s.found;
                try {
                    found = JSON.parse(found);
                     //@FIX_it: the parse action too weired..
                } catch (e) {
                    //ignore
                }
                console.log('found: ', found)
                var fds = foundDs;
                if (found && found.length) {
                    fds = found;
                }
                setFoundDs(fds);
                setLoading(false);
            },
            (er) => {
                setLoading(false);
                // ignore
            }
        );
    }, [foundDs]);

    const scan = useCallback(() => {
        try {
            async function blueTooth() {
                const permissions = {
                    title: 'Ứng dụng yêu cầu cho phép truy cập Bluetooth',
                    message:
                        'Ứng dụng cần truy cập Bluetooth để kết nối với máy in Bluetooth',
                    buttonNeutral: 'Không phải bây giờ',
                    buttonNegative: 'Từ chối',
                    buttonPositive: 'Cho phép',
                };

                const bluetoothConnectGranted =
                    await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                        permissions
                    );
                if (
                    bluetoothConnectGranted ===
                    PermissionsAndroid.RESULTS.GRANTED
                ) {
                    const bluetoothScanGranted =
                        await PermissionsAndroid.request(
                            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                            permissions
                        );
                    if (
                        bluetoothScanGranted ===
                        PermissionsAndroid.RESULTS.GRANTED
                    ) {
                        scanDevices();
                    }
                } else {
                    // ignore akses ditolak
                }
            }
            blueTooth();
        } catch (err) {
            console.warn(err);
        }
    }, [scanDevices]);

    const scanBluetoothDevice = async () => {
        setLoading(true);
        try {
            console.log('Vô try');
                await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ]).then(result => {
                console.log('result', result)
                if (
                    result['android.permission.ACCESS_FINE_LOCATION'] === 'granted'
                ) {
                    scanDevices();
                    setLoading(false);
                } else {
                    setLoading(false);
                }
            });
        } catch (err) {
            setLoading(false);
        }
    };
    return (
        <ScrollView style={styles.container}>
            <View style={styles.bluetoothStatusContainer}>
                <Text
                    style={styles.bluetoothStatus(
                        bleOpend ? '#47BF34' : '#A8A9AA'
                    )}>
                    Bluetooth {bleOpend ? 'Đang hoạt động' : 'Không hoạt động'}
                </Text>
            </View>
            {!bleOpend && (
                <Text style={styles.bluetoothInfo}>
                    Vui lòng bật Bluetooth của bạn
                </Text>
            )}
            <Text style={styles.sectionTitle}>
                Máy in đã được kết nối với thiết bị khác
            </Text>
            {boundAddress.length > 0 && (
                <ItemList
                    label={name}
                    value={boundAddress}
                    onPress={() => unPair(boundAddress)}
                    actionText="Putus"
                    color="#E9493F"
                />
            )}
            {boundAddress.length < 1 && (
                <Text style={styles.printerInfo}>
                    Không có máy in nào được kết nối
                </Text>
            )}
            <Text style={styles.sectionTitle}>
                Thiết bị đã kết nối:
            </Text>
            {loading ? <ActivityIndicator animating={true} /> : null}
            <View style={styles.containerList}>
                {pairedDevices.map((item, index) => {
                    return (
                        <ItemList
                            key={index}
                            onPress={() => connect(item)}
                            label={item.name}
                            value={item.address}
                            connected={item.address === boundAddress}
                            actionText="Kết nối"
                            color="#00BCD4"
                        />
                    );
                })}
            </View>
            <Text style={styles.sectionTitle}>
                Danh sách thiết bị có thể kết nối:
            </Text>
            {loading ? <ActivityIndicator animating={true} /> : null}
            <View style={styles.containerList}>
                {foundDs.map((item, index) => {
                    return (
                        <ItemList
                            key={index}
                            onPress={() => connect(item)}
                            label={item.name}
                            value={item.address}
                            connected={item.address === boundAddress}
                            actionText="Kết nối"
                            color="#00BCD4"
                        />
                    );
                })}
            </View>
            <SamplePrint />
            <Button
                onPress={() => scanBluetoothDevice()}
                title="Scan Bluetooth"
            />
            <View style={{ height: 100 }} />
        </ScrollView>
    );
};

export default FindPrinter;
export const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
        paddingHorizontal: 20,
    },
    containerList: { flex: 1, flexDirection: 'column' },
    bluetoothStatusContainer: {
        justifyContent: 'flex-end',
        alignSelf: 'flex-end',
    },
    bluetoothStatus: (color) => ({
        backgroundColor: color,
        padding: 8,
        borderRadius: 2,
        color: 'white',
        paddingHorizontal: 14,
        marginBottom: 20,
    }),
    bluetoothInfo: {
        textAlign: 'center',
        fontSize: 16,
        color: '#FFC806',
        marginBottom: 20,
    },
    sectionTitle: { fontWeight: 'bold', fontSize: 18, marginBottom: 12 },
    printerInfo: {
        textAlign: 'center',
        fontSize: 16,
        color: '#E9493F',
        marginBottom: 20,
    },
});