import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text, ActivityIndicator, Alert,
  TextInput
} from 'react-native';

import {NetPrinterEventEmitter, RN_THERMAL_RECEIPT_PRINTER_EVENTS, NetPrinter} from 'react-native-bluetooth-nest-printer';
import { hsdLogo } from './dummy-logo';

const Print = () => {
  const [printer, setPrinter] = useState('');
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState({});
  const [selectedNetPrinter, setSelectedNetPrinter] = useState({
    device_name: 'My Net Printer',
    host: '192.168.1.212',
    port: '9100',
    printerType: 'net',
  });

  useEffect(() => {
    // if (devices.length === 0) {
    //   setLoading(true);
    //   NetPrinterEventEmitter.addListener(
    //     RN_THERMAL_RECEIPT_PRINTER_EVENTS.EVENT_NET_PRINTER_SCANNED_SUCCESS,
    //     (printers) => {
    //       console.log({ printers });
    //       if (printers) {
    //         console.log({ printers });
    //         setLoading(false);
    //         setDevices(printers);
    //       }
    //     },
    //   );
    //   (async () => {
    //     const results = await NetPrinter.getDeviceList();
    //     console.log({ results });
    //   })();
    // }
    // return () => {
    //   NetPrinterEventEmitter.removeAllListeners(
    //     RN_THERMAL_RECEIPT_PRINTER_EVENTS.EVENT_NET_PRINTER_SCANNED_SUCCESS,
    //   );
    //   NetPrinterEventEmitter.removeAllListeners(
    //     RN_THERMAL_RECEIPT_PRINTER_EVENTS.EVENT_NET_PRINTER_SCANNED_ERROR,
    //   );
    // };
  }, []);

  const onSelectedPrinter = (text) => {
    const printer = {
      device_name: 'My Net Printer',
      host: text,
      port: '9100',
      printerType: 'net'
    }
    // navigate('Home', { printer });
    // console.log('printer: ', printer);
    // setSelectedNetPrinter({
    //   ...selectedNetPrinter,
    //   ...printer,
    // });
    setSelectedNetPrinter(printer);
    handleConnectSelectedPrinter();
  };

  const alertPrinter = () => {
    alert(selectedNetPrinter.host);
  }

  const handlePrint = async () => {
    try {
      const Printer = NetPrinter;
      console.log('Printer', Printer)
      // Printer.printText('<C>sample text</C>', {
      //   cut: false,
      // });
      // Printer.printImage(
      //   'https://sportshub.cbsistatic.com/i/2021/04/09/9df74632-fde2-421e-bc6f-d4bf631bf8e5/one-piece-trafalgar-law-wano-anime-1246430.jpg',
      // );
      // Printer.printBill('<C>sample text</C>');
      Printer.printImage(
        `https://demos.vn/img/logo-small.png`,
        {
          // imageWidth: 300,
          // imageHeight: 300,
          // cut: true
        }
      );
      Printer.printImageBase64(
        hsdLogo,
        {
          imageWidth: 600,
          imageHeight: 800,
          // cut: true
        }
      );
      Printer.printText(`\r\n\r\n\r\n`);
      Printer.printText(`\x1d\x56\x00`);
    } catch (err) {
      console.warn(err);
    }
  };

  const handleConnectSelectedPrinter = async () => {
    setLoading(true);
    
    try {
      if (!selectedNetPrinter) {
        setLoading(false);
        return;
      }
      
      const status = await NetPrinter.connectPrinter(selectedNetPrinter.host || '', 9100);
      setLoading(false);
      
      console.log('connect -> status', status);
      Alert.alert(
        'Connect successfully!',
        `Connected to ${status.host ?? 'Printers'} !`,
      );
    } catch (err) {
      Alert.alert('Connect failed!', `${err} !`);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <>
      {loading ? (
        <ActivityIndicator animating={true} style={{justifyContent: 'center', flex: 1, alignItems: 'center'}} />
      ) : (
        <View style={styles.container}>
          {devices !== undefined &&
            devices.length > 0 &&
            devices.map((item, index) => {
              const onPress = () => onSelectedPrinter(item);
              return (
                <TouchableOpacity key={`printer-item-${index}`} onPress={onPress}>
                  <Text>{item.host}</Text>
                </TouchableOpacity>
              );
            })}
            <TextInput style={{width: 200, borderWidth: 1, borderColor: 'black', padding: 5}} value={printer} onChangeText={(text) => {setPrinter(text)}} />

            <TouchableOpacity onPress={() => {onSelectedPrinter(printer)}}>
              <Text>Printer</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePrint}>
              <Text>In hình</Text>
            </TouchableOpacity>
        </View>
      )}
    </>
  );
};
export default Print;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
});
