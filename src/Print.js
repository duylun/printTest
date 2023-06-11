import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text, ActivityIndicator, Alert,
  TextInput,
  Platform
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
    host: '',
    port: 9100,
    printerType: 'net',
  });
  const Printer = NetPrinter;
  
  const scanWifi = async () => {
    if (devices.length === 0) {
      await Printer.init();
      setLoading(true);
      NetPrinterEventEmitter.addListener(
        RN_THERMAL_RECEIPT_PRINTER_EVENTS.EVENT_NET_PRINTER_SCANNED_SUCCESS,
        printers => {
          console.log({printers});
          if (printers) {
            console.log({printers});
            setLoading(false);
            setDevices(printers);
          }
        },
      );
      (async () => {
        const results = await NetPrinter.getDeviceList();
        console.log('results', results)
      })();
    }
    return () => {
      NetPrinterEventEmitter.removeAllListeners(
        RN_THERMAL_RECEIPT_PRINTER_EVENTS.EVENT_NET_PRINTER_SCANNED_SUCCESS,
      );
      NetPrinterEventEmitter.removeAllListeners(
        RN_THERMAL_RECEIPT_PRINTER_EVENTS.EVENT_NET_PRINTER_SCANNED_ERROR,
      );
    };
  };

  console.log('devices', devices);
  // useEffect(() => {
  //   if (devices.length === 0) {
  //     setLoading(true);
  //     NetPrinterEventEmitter.addListener(
  //       RN_THERMAL_RECEIPT_PRINTER_EVENTS.EVENT_NET_PRINTER_SCANNED_SUCCESS,
  //       (printers) => {
  //         console.log({ printers });
  //         if (printers) {
  //           console.log({ printers });
  //           setLoading(false);
  //           setDevices(printers);
  //         }
  //       },
  //     );
  //     (async () => {
  //       const results = await NetPrinter.getDeviceList();
  //       console.log({ results });
  //     })();
  //   }
  //   return () => {
  //     NetPrinterEventEmitter.removeAllListeners(
  //       RN_THERMAL_RECEIPT_PRINTER_EVENTS.EVENT_NET_PRINTER_SCANNED_SUCCESS,
  //     );
  //     NetPrinterEventEmitter.removeAllListeners(
  //       RN_THERMAL_RECEIPT_PRINTER_EVENTS.EVENT_NET_PRINTER_SCANNED_ERROR,
  //     );
  //   };
  // }, []);

  const onClickIpPrinter = (printer) => {
    // console.log('printer: ', printer);
    setSelectedNetPrinter({
      ...selectedNetPrinter,
      ...printer,
    });
    handleConnectSelectedPrinter();
  };

  const onSelectedPrinter = (text) => {
    const printer = {
      device_name: 'My Net Printer',
      host: text,
      port: 9100,
      printerType: 'net'
    }
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
    // await Printer.init();
    try {
      // console.log('Printer', Printer)
      // Printer.printText('<C>sample text</C>', {
      //   cut: false,
      // });
      // Printer.printImage(
      //   'https://sportshub.cbsistatic.com/i/2021/04/09/9df74632-fde2-421e-bc6f-d4bf631bf8e5/one-piece-trafalgar-law-wano-anime-1246430.jpg',
      // );
      // Printer.printBill('<C>sample text</C>');
      Printer.printText('<C>sample text</C>', {
        cut: true,
      });
      Printer.printImage(
        `https://demos.vn/upload/hinh_khach_hang/1675747933_coopmart.jpg`,
        {
          imageWidth: 300,
          // imageHeight: 300,
          // cut: true
        }
      );
  
      Printer.printImageBase64(
        hsdLogo,
        {
          imageWidth: 584,
          // imageHeight: 800,
          // cut: true
        }
      );

      if(Platform.OS === 'ios'){
        Printer.printText(`\r\n\r\n\r\n`);
        Printer.printText(`\x1d\x56\x00`);
      }
      else{
        Printer.printText('', {cut: true});
      }
      
    } catch (err) {
      // console.warn(err);
      Alert.alert('Thông báo!', 'Chưa kết nối với máy in, vui lòng kiểm tra lại!')
    }
  };

  const handleConnectSelectedPrinter = async () => {
    await Printer.init();
    setLoading(true);
    
    try {
      if (!selectedNetPrinter) {
        setLoading(false);
        return;
      }
      
      const status = await Printer.connectPrinter(selectedNetPrinter.host || '', 9100);
      console.log('status', status, typeof(status))
      setLoading(false);
      
      console.log('connect -> status', status);
      Alert.alert(
        'Connect successfully!',
        `Connected to ${status.host ?? 'Printers'} !`,
      );
    } catch (err) {
      Alert.alert('Lỗi!', 'Không thể kết nối với máy in!');
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
              const onPress = () => onClickIpPrinter(item);
              return (
                <TouchableOpacity key={`printer-item-${index}`} onPress={onPress}>
                  <Text>{item.host}</Text>
                </TouchableOpacity>
              );
            })}

            <View>
              <TouchableOpacity onPress={scanWifi}>
                <Text>Scan</Text>
              </TouchableOpacity>
            </View>

            <TextInput style={{width: 200, borderWidth: 1, borderColor: 'black', padding: 5}} value={printer} onChangeText={(text) => {setPrinter(text)}} />
            
            <Text>IP máy in: {selectedNetPrinter.host}</Text>
          

            <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
              <TouchableOpacity onPress={() => {onSelectedPrinter(printer)}}>
                <Text>Kết nối</Text>
              </TouchableOpacity>

              <TouchableOpacity style={{marginLeft: 20}} onPress={handlePrint}>
                <Text>In hình</Text>
              </TouchableOpacity>
            </View>
           
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
