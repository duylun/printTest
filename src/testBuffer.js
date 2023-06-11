import React, {useState, useEffect} from 'react';
import { Text, View, TouchableOpacity, Alert, Platform, Image } from 'react-native';
import * as EPToolkit from './utils/EPToolkit';
import {NetPrinterEventEmitter, RN_THERMAL_RECEIPT_PRINTER_EVENTS, NetPrinter} from 'react-native-bluetooth-nest-printer';
import { hsdLogo } from './dummy-logo';
// import ImageSize from 'react-native-image-size';

const testBuffer =  () => {
    const selectedNetPrinter = {
        device_name: 'My Net Printer',
        host: '192.168.1.212',
        port: 9100,
        printerType: 'net',
      };
    const Printer = NetPrinter;

    const widthPrint = {
        WIDTH_58: 384,
        WIDTH_80: 576,
    }

    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    
    const uri = `data:image/jpeg;base64,`+hsdLogo;

    useEffect(() => {
        Image.getSize(
            uri,
            (width, height) => {
                setWidth(width);
                setHeight(height);
            },
            (error) => {
              console.log(error);
            }
          );
    }, []);

    const connect = async () => {
        await handleConnectSelectedPrinter();
    }

    const PrinterOptions = {
      beep: false,
      cut: false,
      tailingLine: false,
      encoding: '',
    };

    const PrinterImageOptions = {
      beep: false,
      cut: false,
      tailingLine: false,
      encoding: '',
      imageWidth: 0,
      imageHeight: 0,
      paddingX: 0,
    };

    const textTo64Buffer = (text, opts = PrinterOptions) => {
      const defaultOptions = {
        beep: false,
        cut: false,
        tailingLine: false,
        encoding: 'UTF8',
      };

      const options = {
        ...defaultOptions,
        ...opts,
      };

      const fixAndroid = '\n';
      const buffer = EPToolkit.exchange_text(text + fixAndroid, options);
      return buffer.toString('base64');
    };

    const textPreprocessingIOS = (text, canCut = true, beep = true) => {
      let options = {
        beep: beep,
        cut: canCut,
      };
      return {
        text: text
          .replace(/<\/?CB>/g, '')
          .replace(/<\/?CM>/g, '')
          .replace(/<\/?CD>/g, '')
          .replace(/<\/?C>/g, '')
          .replace(/<\/?D>/g, '')
          .replace(/<\/?B>/g, '')
          .replace(/<\/?M>/g, ''),
        opts: options,
      };
    };

    const text = 'Day la mau in thu';


    const scale = parseFloat(widthPrint.WIDTH_80 / width); // Tính toán tỷ lệ scale
    const scaledHeight = parseInt(height * scale); // Chiều cao đã được scale


    const print = async () => {
        try {
            if(Platform.OS === 'ios')
            {
                Printer.printText('Day la noi dung in thu');
                Printer.printText(`\r\n\r\n\r\n`);
                Printer.printText(`\x1d\x56\x00`);
            }
            else{
                // Printer.printText(textTo64Buffer('Day la noi dung in thu', {
                //     cut: false,
                //     tailingLine: true,
                // }));

                Printer.printImageBase64(hsdLogo, {
                  imageWidth: widthPrint.WIDTH_80,
                  imageHeight: scaledHeight
                });
                Printer.printText(textTo64Buffer('', {
                    cut: true,
                    tailingLine: true,
                }));
            }
          
        } catch (err) {
          // console.warn(err);
          Alert.alert(
            'Thông báo!',
            'Chưa kết nối với máy in, vui lòng kiểm tra lại!',
          );
        }
    }

    const handleConnectSelectedPrinter = async () => {
      await Printer.init();
      try {
        const status = await Printer.connectPrinter(selectedNetPrinter.host, 9100);
        console.log('connect -> status', status);
        Alert.alert(
            'Connect successfully!',
            `Connected!`,
        );
      } catch (err) {
        Alert.alert('Lỗi!', 'Không thể kết nối với máy in!');
      }
    };

    // const text = textTo64Buffer('Day la mau in thu', {
    //     cut: true
    // });
    // console.log('text', text, typeof(text))

    // console.log(Printer.printText(text));

    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <TouchableOpacity onPress={() => {connect()}}>
                <Text>Connect</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {print()}}>
                <Text>In</Text>
            </TouchableOpacity>
            <Text>
            {width}(w) X {height}(h)
          </Text>
        </View>
    )
};

export default testBuffer;
