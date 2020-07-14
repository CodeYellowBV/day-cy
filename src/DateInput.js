import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Input } from 'semantic-ui-react';
import { DateTime } from 'luxon';
import MaskedInput from 'react-text-mask';
import createAutoCorrectedDatePipe from 'text-mask-addons/dist/createAutoCorrectedDatePipe'

// we only support auto corrected date pipe for a fixed set of common date formats
const formats = {
    'dd-LL-yyyy': 'dd-mm-yyyy',
    'LL-dd-yyyy': 'mm-dd-yyyy',
    'yyyy-LL-dd': 'yyyy-mm-dd',
    'HH:mm': 'HH:MM',
}
const masks = {
    'dd-mm-yyyy': [/\d/,/\d/,'-',/\d/,/\d/,'-',/\d/,/\d/,/\d/,/\d/],
    'mm-dd-yyyy': [/\d/,/\d/,'-',/\d/,/\d/,'-',/\d/,/\d/,/\d/,/\d/],
    'yyyy-mm-dd': [/\d/,/\d/,/\d/,/\d/,'-',/\d/,/\d/,'-',/\d/,/\d/],
    'HH:MM': [/\d/,/\d/,':',/\d/,/\d/],
}

export default class DateInput extends Component {
    static propTypes = {
        format: PropTypes.string,
        value: PropTypes.instanceOf(DateTime),
        onChange: PropTypes.func.isRequired,
    };

    static defaultProps = {
        format: 'dd-LL-yyyy',
    };

    state = { value: null, typeValue: null };
    autoCorrectedDatePipe = Object.keys(formats).includes(this.props.format) ? createAutoCorrectedDatePipe(formats[this.props.format]) : null

    constructor(...args) {
        super(...args);
        this.onChange = this.onChange.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.renderInput = this.renderInput.bind(this);
    }

    onChange(e, { value }) {
        const { format, onChange } = this.props;

        this.setState({ typeValue: value });

        const date = DateTime.fromFormat(value, format);
        if (!date.invalid) {
            onChange(date);
        }
    }

    onBlur(...args) {
        const { onBlur } = this.props;
        this.setState({ typeValue: null });
        if (onBlur) {
            onBlur(...args);
        }
    }

    renderInput(ref, props) {
        return (
            <Input
                ref={(node) => {
                    let domNode = ReactDOM.findDOMNode(node);
                    if (domNode) {
                        domNode = domNode.getElementsByTagName('input')[0];
                    }
                    return ref(domNode);
                }}
                {...props}
            />
        );
    }

    render() {
        const { typeValue } = this.state; 
        const { format, value, ...props } = this.props;

        delete props.onChange;
        delete props.onBlur;

        if(this.autoCorrectedDatePipe !== null){
            return (
                <MaskedInput
                    mask={masks[formats[format]]}
                    pipe={this.autoCorrectedDatePipe}
                    value={
                        typeValue !== null
                        ? typeValue
                        : value
                        ? value.toFormat(format)
                        : ''
                    }
                    onChange={this.onChange}
                    onBlur={this.onBlur}
                    keepCharPositions={true}
                    guide={true}
                    render={this.renderInput}
                    {...props}
                />
            );
        } else {
            return ( 
                <Input
                    value={
                        typeValue !== null
                        ? typeValue
                        : value
                        ? value.toFormat(format)
                        : ''
                    }
                    onChange={this.onChange}
                    onBlur={this.onBlur}
                    {...props}
                />
            );
        }
    }
}
