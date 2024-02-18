export const PropertyType =
{
    Text : 1,
    Integer : 2,
    Number : 3,
    Boolean : 4,
    Percent : 5,
    Color : 6,
    Angle: 7
};

export class Property
{
    constructor (type, name, value)
    {
        this.type = type;
        this.name = name;
        this.value = value;
    }

    Clone ()
    {
        const clonable = (this.type === PropertyType.Color);
        if (clonable) {
            return new Property (this.type, this.name, this.value.Clone ());
        } else {
            return new Property (this.type, this.name, this.value);
        }
    }
}

export class PropertyGroup
{
    constructor (name)
    {
        this.name = name;
        this.properties = [];
    }

    PropertyCount ()
    {
        return this.properties.length;
    }

    AddProperty (property)
    {
        this.properties.push (property);
    }

    GetProperty (index)
    {
        return this.properties[index];
    }

    Clone ()
    {
        let cloned = new PropertyGroup (this.name);
        for (let property of this.properties) {
            cloned.AddProperty (property.Clone ());
        }
        return cloned;
    }

    ConvertPropertiesWrtToApi()
    {
        const data = {};
        for (let prp of this.properties) {
            let unit = '';
            let type = '';
            if (prp.type === PropertyType.Number) {
                type = 'length';
                unit = 'mm';
            } else if (prp.type === PropertyType.Angle) {
                type = 'angle';
                unit = 'deg';
            }
            data[prp.name] = {
                value: prp.value,
                unit: unit
            }
        }
        return data;
    }
}
